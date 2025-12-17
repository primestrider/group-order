import {
  Timestamp,
  type Unsubscribe,
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"

import { firebaseDb } from "@/plugins/firebase"
import { auth } from "@/plugins/firebase/auth"

import type { OrderDetailItems, OrderDetailResponse } from "../models"
import type { AddOrderItemPayload } from "../models/add-item.schema"
import type { CreateOrderRequest } from "../models/create-order.schema"

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
  if (!auth?.currentUser) {
    throw new Error("User is not authenticated")
  }

  if (!firebaseDb) {
    throw new Error("Firebase is not initialized")
  }

  const values = {
    orderName: payload.orderName.trim(),
    orderDescription: payload.orderDescription?.trim() ?? "",
    maxParticipants: payload.maxParticipants,
    lastOrderAt: Timestamp.fromMillis(payload.lastOrderAt),

    // ownership
    ownerUid: auth.currentUser.uid,

    // counters
    participantsCount: 0,

    // metadata
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const documentReference = await addDoc(collection(firebaseDb, "orders"), values)

  return documentReference.id
}

/**
 * Fetch single order detail by orderId
 *
 * @param id - Firestore document ID
 * @throws Error if order not found
 */
export const getDetailOrder = async (id: string): Promise<OrderDetailResponse> => {
  if (!firebaseDb) {
    throw new Error("Firebase is not initialized")
  }

  const referenceDocument = doc(firebaseDb, "orders", id)
  const snapshotDocument = await getDoc(referenceDocument)

  if (!snapshotDocument.exists()) {
    throw new Error("Order not found")
  }

  const response = snapshotDocument.data()

  return {
    id: snapshotDocument.id,
    orderName: response.orderName,
    orderDescription: response.orderDescription,
    ownerUid: response.ownerUid,
    maxParticipants: response.maxParticipants,
    participantsCount: response.participantsCount,
    lastOrderAt: response.lastOrderAt.toDate(),
    createdAt: response.createdAt.toDate(),
  }
}

/**
 * Create or update user's order item
 *
 * - One item per user per order
 * - User can edit their own item
 */
export const upsertOrderItem = async (payload: AddOrderItemPayload): Promise<void> => {
  if (!firebaseDb || !auth?.currentUser) {
    throw new Error("Firebase not ready")
  }

  const uid = auth.currentUser.uid

  const itemRef = doc(firebaseDb, "orders", payload.orderId, "items", uid)

  const snap = await getDoc(itemRef)

  if (snap.exists()) {
    // � UPDATE
    await setDoc(
      itemRef,
      {
        participantName: payload.participantName,
        note: payload.note ?? null,
        items: payload.items,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  } else {
    // � CREATE
    await setDoc(itemRef, {
      participantName: payload.participantName,
      note: payload.note ?? null,
      items: payload.items,
      createdByUid: uid,
      createdAt: serverTimestamp(),
    })
  }
}

/**
 * Listen realtime updates for order items
 *
 * - Realtime updates when users add/edit items
 * - One document per user (docId = userUid)
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
        items: data.items ?? [],
        createdByUid: data.createdByUid,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.(),
      }
    })

    onChange(items)
  })
}
