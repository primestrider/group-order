export default {
  feature_title: "Order Management",

  create_order: {
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

  order_detail: {
    add_item: {
      form: {
        title: "Add Your Items",

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
      },
    },
  },
}
