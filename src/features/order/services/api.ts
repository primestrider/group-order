import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"

import { firebaseDb } from "@/plugins/firebase"
import { auth } from "@/plugins/firebase/auth"

import type { OrderDetailResponse } from "../models"
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
  if (!firebaseDb) {
    throw new Error("Firebase is not initialized")
  }

  if (!auth?.currentUser) {
    throw new Error("User is not authenticated")
  }

  const uid = auth.currentUser.uid

  const itemRef = doc(
    firebaseDb,
    "orders",
    payload.orderId,
    "items",
    uid, // 🔑 UID as doc ID
  )

  await setDoc(
    itemRef,
    {
      participantName: payload.participantName,
      note: payload.note ?? null,
      items: payload.items,

      // immutable audit fields
      createdBy: uid,
      updatedAt: serverTimestamp(),

      // only set on first create
      createdAt: serverTimestamp(),
    },
    { merge: true },
  )
}
