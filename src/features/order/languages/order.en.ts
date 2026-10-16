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

    recap: {
      title: "Order Recap",
      owner_only: "Only visible to the order creator",
      total: "Total items",
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

        note: {
          label: "Note",
          placeholder: "Enter notes",
        },

        button: {
          add_item: "Add Item",
          confirm: "Confirm",
          cancel: "Cancel",
        },
      },

      notification_add_item: {
        success: "Success adding your items to the order.",
        error: "Error when trying to add your items, please try again later.",
        closed: "This order is closed, the last order time has passed.",
        full: "This order has reached the maximum number of participants.",
      },
    },
  },
}
