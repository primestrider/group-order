export default {
  feature_title: "Order Management",

  create_order: {
    form: {
      orderName: {
        label: "Order Name",
        placeholder: "Enter the order name",
        hint: "example: Order Bubble Tea",
      },

      orderDescription: {
        label: "Order Description",
        placeholder: "Optional description for this order",
      },

      maxParticipants: {
        label: "Maximum Participants",
        placeholder: "Enter the maximum number of participants",
      },

      lastOrderAt: {
        label: "Last Order Date",
        placeholder: "Select the last order date and time",
      },

      button: {
        submit: "Create Order",
      },
    },
  },
}
