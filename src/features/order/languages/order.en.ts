export default {
  feature_title: "Order Management",

  dashboard: {
    title: "Group Order",
    start_order: "Start Order",
    create_order: "Create Order",
    divider: "or",
    join_order: "Join Order",
  },

  create_order: {
    title: "Create Order",
    back_to_home: "Back to home",

    form: {
      orderName: {
        label: "Order Name",
        placeholder: "Enter the order name (example: Order Seblak Mewek)",
        hint: "example: Order Bubble Tea",
      },

      orderDescription: {
        label: "Order Description",
        placeholder: "Optional description for this order",
      },

      maxParticipants: {
        label: "Maximum Participants",
        placeholder: "Maximum number of participants",
      },

      lastOrderAt: {
        label: "Last Order",
        placeholder: "Select the last order date and time",
      },

      extraFee: {
        label: "Shipping / Extra Fee (Rp)",
        hint: "Split evenly between participants",
      },

      paymentInfo: {
        label: "Payment Info",
        placeholder: "Example: BCA 1234567890 a.n. Budi / GoPay 0812...",
      },

      button: {
        submit: "Create Order",
      },
    },

    error: "Error when creating order, please try again later.",
  },

  join_order: {
    label: "Order ID or link",
    placeholder: "Enter Order ID or paste the order link",
    button: "Join",
    error_required: "Please enter an Order ID or link.",
  },

  order_detail: {
    share_title: "Group Order",
    copy_link: "Copy link",
    share_link: "Share link",
    you: "You",
    note: "Note:",
    empty: "No items yet. Be the first to add your order!",

    status: {
      open: "Open",
      closed: "Closed",
    },

    payment: {
      paid: "Paid",
      mark_paid: "Mark paid",
      mark_unpaid: "Mark unpaid",
      to_pay: "To pay",
      per_person: "per person",
    },

    manage: {
      edit: "Edit order",
      edit_title: "Edit Order",
      save: "Save",
      close: "Close order",
      reopen: "Reopen order",
      reopen_hint: "Move the last order time to the future (Edit order) to reopen.",
      leave: "Leave",
      remove: "Remove",
      confirm_leave: "Leave this order? Your items will be removed.",
      confirm_remove: "Remove participant",

      notification: {
        updated: "Order updated.",
        closed: "Order closed.",
        reopened: "Order reopened.",
        removed: "Participant removed from the order.",
        max_below_participants:
          "Maximum participants cannot be lower than the number of joined participants.",
        error: "Something went wrong, please try again later.",
      },
    },

    recap: {
      title: "Order Recap",
      owner_only: "Only visible to the order creator",
      total: "Total items",
      grand_total: "Grand total",
      participants: "Per participant",
      copy: "Copy recap",
      copied: "Copied",
    },

    add_item: {
      form: {
        title: "Add Your Items",
        edit_title: "Edit Your Items",

        participantName: {
          label: "Your name",
          placeholder: "Enter your name",
        },

        items: {
          label: "Items",
          placeholder: "Enter item name",
        },

        quantity: {
          label: "Quantity",
        },

        price: {
          label: "Unit price (Rp)",
          placeholder: "Price",
          total: "Total",
        },

        note: {
          label: "Note",
          placeholder: "Enter notes",
        },

        button: {
          add_item: "Add Item",
          confirm: "Confirm",
          remove_item: "Remove item",
          cancel: "Cancel",
        },
      },

      notification_add_item: {
        success: "Success adding your items to the order.",
        error: "Error when trying to add your items, please try again later.",
        closed: "This order is closed.",
        full: "This order has reached the maximum number of participants.",
      },
    },
  },
}
