import {
  type DocumentData,
  type DocumentSnapshot,
  Timestamp,
  type Unsubscribe,
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore"

import { firebaseDb } from "@/plugins/firebase"
import { auth } from "@/plugins/firebase/auth"

import { isOrderOpen } from "../helpers/order"
import {
  type OrderDetailItems,
  type OrderDetailResponse,
  OrderItemError,
  OrderStatus,
} from "../models"
import type { AddOrderItemPayload } from "../models/add-item.schema"
import type { CreateOrderRequest } from "../models/create-order.schema"

const requireFirebase = () => {
  if (!firebaseDb || !auth?.currentUser) {
    throw new Error("Firebase not ready")
  }

  return { db: firebaseDb, uid: auth.currentUser.uid }
}

/**
 * Editable order fields shared by create & edit
 */
const toOrderValues = (payload: CreateOrderRequest) => ({
  orderName: payload.orderName.trim(),
  orderDescription: payload.orderDescription?.trim() ?? "",
  maxParticipants: payload.maxParticipants,
  lastOrderAt: Timestamp.fromMillis(payload.lastOrderAt),
  extraFee: payload.extraFee,
  paymentInfo: payload.paymentInfo?.trim() ?? "",
  menu: payload.menu.map((menuItem) => ({
    itemName: menuItem.itemName.trim(),
    price: menuItem.price,
  })),
})

/**
 * Map Firestore order document; fills defaults for orders created
 * before status / payment fields existed
 */
const toOrderDetail = (snapshot: DocumentSnapshot<DocumentData>): OrderDetailResponse => {
  const data = snapshot.data()!

  return {
    id: snapshot.id,
    orderName: data.orderName,
    orderDescription: data.orderDescription,
    ownerUid: data.ownerUid,
    maxParticipants: data.maxParticipants,
    participantsCount: data.participantsCount ?? 0,
    status: data.status ?? OrderStatus.OPEN,
    extraFee: data.extraFee ?? 0,
    paymentInfo: data.paymentInfo ?? "",
    menu: data.menu ?? [],
    lastOrderAt: data.lastOrderAt.toDate(),
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  }
}

/**
 * Creates a new group order in Firestore.
 *
 * This function:
 * - Requires the user to be authenticated (Anonymous Auth supported)
 * - Stores the current user as the order owner (`ownerUid`)
 * - Converts `lastOrderAt` from a timestamp number into a Firestore `Timestamp`
 * - Initializes metadata fields and counters
 *
 * @param payload - Validated create order form values
 * @returns A promise that resolves with the newly created order ID
 *
 * @throws {Error} If the user is not authenticated
 */
export const createGroupOrder = async (payload: CreateOrderRequest): Promise<string> => {
  const { db, uid } = requireFirebase()

  const documentReference = await addDoc(collection(db, "orders"), {
    ...toOrderValues(payload),

    // ownership
    ownerUid: uid,

    // state & counters
    status: OrderStatus.OPEN,
    participantsCount: 0,

    // metadata
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return documentReference.id
}

/**
 * Orders created by the current user, newest first.
 *
 * Sorted client-side to avoid requiring a composite index (ownerUid + createdAt).
 */
export const getMyOrders = async (): Promise<OrderDetailResponse[]> => {
  const { db, uid } = requireFirebase()

  const snapshot = await getDocs(query(collection(db, "orders"), where("ownerUid", "==", uid)))

  return snapshot.docs
    .map(toOrderDetail)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

/**
 * Owner edits order settings.
 *
 * @throws {Error} {@link OrderItemError.MAX_BELOW_PARTICIPANTS} when the new
 * limit is lower than the number of joined participants
 */
export const updateGroupOrder = async ({
  orderId,
  ...payload
}: CreateOrderRequest & { orderId: string }): Promise<void> => {
  const { db } = requireFirebase()
  const orderRef = doc(db, "orders", orderId)

  await runTransaction(db, async (transaction) => {
    const orderSnap = await transaction.get(orderRef)

    if (!orderSnap.exists()) {
      throw new Error("Order not found")
    }

    if (payload.maxParticipants < (orderSnap.data().participantsCount ?? 0)) {
      throw new Error(OrderItemError.MAX_BELOW_PARTICIPANTS)
    }

    transaction.update(orderRef, { ...toOrderValues(payload), updatedAt: serverTimestamp() })
  })
}

/**
 * Owner closes the order early or reopens it
 */
export const setOrderStatus = async ({
  orderId,
  status,
}: {
  orderId: string
  status: OrderStatus
}): Promise<void> => {
  const { db } = requireFirebase()

  await updateDoc(doc(db, "orders", orderId), { status, updatedAt: serverTimestamp() })
}

/**
 * Listen realtime updates for one order
 *
 * @param onChange - Receives `null` when the order does not exist
 * @param onError - Permission / network errors
 * @returns unsubscribe function
 */
export const listenOrderDetailRealtime = (
  orderId: string,
  onChange: (order: OrderDetailResponse | null) => void,
  onError: (error: Error) => void,
): Unsubscribe => {
  if (!firebaseDb) {
    throw new Error("Firebase is not initialized")
  }

  return onSnapshot(
    doc(firebaseDb, "orders", orderId),
    (snapshot) => onChange(snapshot.exists() ? toOrderDetail(snapshot) : null),
    onError,
  )
}

/**
 * Create or update user's order item
 *
 * - One item per user per order
 * - User can edit their own item
 * - Rejected when closed or after `lastOrderAt` ({@link OrderItemError.CLOSED})
 * - New participants rejected when `maxParticipants` is reached ({@link OrderItemError.FULL})
 */
export const upsertOrderItem = async (payload: AddOrderItemPayload): Promise<void> => {
  const { db, uid } = requireFirebase()

  const orderRef = doc(db, "orders", payload.orderId)
  const itemRef = doc(orderRef, "items", uid)

  const itemValues = {
    participantName: payload.participantName,
    note: payload.note ?? null,
    items: payload.items,
  }

  // Transaction keeps `participantsCount` consistent when users join concurrently
  await runTransaction(db, async (transaction) => {
    const orderSnap = await transaction.get(orderRef)

    if (!orderSnap.exists()) {
      throw new Error("Order not found")
    }

    const order = toOrderDetail(orderSnap)

    if (!isOrderOpen(order)) {
      throw new Error(OrderItemError.CLOSED)
    }

    const itemSnap = await transaction.get(itemRef)

    if (itemSnap.exists()) {
      // UPDATE
      transaction.update(itemRef, { ...itemValues, updatedAt: serverTimestamp() })
      return
    }

    if (order.participantsCount >= order.maxParticipants) {
      throw new Error(OrderItemError.FULL)
    }

    // CREATE (+ claim a participant slot)
    transaction.set(itemRef, { ...itemValues, createdByUid: uid, createdAt: serverTimestamp() })
    transaction.update(orderRef, {
      participantsCount: increment(1),
      updatedAt: serverTimestamp(),
    })
  })
}

/**
 * Remove a participant's item and free their slot.
 *
 * - Participant leaving: only while the order is open
 * - Order owner removing someone: allowed anytime
 */
export const removeOrderItem = async ({
  orderId,
  participantUid,
}: {
  orderId: string
  participantUid: string
}): Promise<void> => {
  const { db, uid } = requireFirebase()

  const orderRef = doc(db, "orders", orderId)
  const itemRef = doc(orderRef, "items", participantUid)

  await runTransaction(db, async (transaction) => {
    const orderSnap = await transaction.get(orderRef)

    if (!orderSnap.exists()) {
      throw new Error("Order not found")
    }

    const order = toOrderDetail(orderSnap)

    if (order.ownerUid !== uid && !isOrderOpen(order)) {
      throw new Error(OrderItemError.CLOSED)
    }

    const itemSnap = await transaction.get(itemRef)

    // Already removed (e.g. double click / removed by owner meanwhile)
    if (!itemSnap.exists()) return

    transaction.delete(itemRef)
    transaction.update(orderRef, {
      participantsCount: increment(-1),
      updatedAt: serverTimestamp(),
    })
  })
}

/**
 * Owner marks a participant as paid / unpaid
 */
export const setOrderItemPaid = async ({
  orderId,
  participantUid,
  isPaid,
}: {
  orderId: string
  participantUid: string
  isPaid: boolean
}): Promise<void> => {
  const { db } = requireFirebase()

  await updateDoc(doc(db, "orders", orderId, "items", participantUid), { isPaid })
}

/**
 * Listen realtime updates for order items
 *
 * - Realtime updates when users add/edit items
 * - One document per user (docId = userUid)
 * - Sorted by join time
 *
 * @param orderId - Target order ID
 * @param onChange - Callback when data changes
 * @returns unsubscribe function
 */
export const listenOrderItemsRealtime = (
  orderId: string,
  onChange: (items: OrderDetailItems[]) => void,
): Unsubscribe => {
  if (!firebaseDb) {
    throw new Error("Firebase is not initialized")
  }

  const itemsRef = collection(firebaseDb, "orders", orderId, "items")

  const q = query(itemsRef)

  return onSnapshot(q, (snapshot) => {
    const items: OrderDetailItems[] = snapshot.docs.map((doc) => {
      const data = doc.data()

      return {
        id: doc.id, // == userUid
        participantName: data.participantName,
        note: data.note ?? null,
        // items saved before prices existed default to 0
        items: (data.items ?? []).map((item: Partial<OrderDetailItems["items"][number]>) => ({
          itemName: item.itemName ?? "",
          quantity: item.quantity ?? 0,
          price: item.price ?? 0,
        })),
        isPaid: data.isPaid ?? false,
        createdByUid: data.createdByUid,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.(),
      }
    })

    onChange(items.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()))
  })
}
