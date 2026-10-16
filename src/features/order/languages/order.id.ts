export default {
  feature_title: "Manajemen Order",

  dashboard: {
    title: "Group Order",
    start_order: "Mulai Order",
    create_order: "Buat Order",
    divider: "atau",
    join_order: "Gabung Order",
  },

  create_order: {
    title: "Buat Order",
    back_to_home: "Kembali ke beranda",

    form: {
      orderName: {
        label: "Nama Order",
        placeholder: "Masukkan nama order (contoh: Order Seblak Mewek)",
        hint: "contoh: Order Bubble Tea",
      },

      orderDescription: {
        label: "Deskripsi Order",
        placeholder: "Deskripsi opsional untuk order ini",
      },

      maxParticipants: {
        label: "Maksimal Peserta",
        placeholder: "Jumlah maksimal peserta",
      },

      lastOrderAt: {
        label: "Batas Order",
        placeholder: "Pilih tanggal dan jam batas order",
      },

      button: {
        submit: "Buat Order",
      },
    },

    error: "Gagal membuat order, silakan coba lagi nanti.",
  },

  join_order: {
    label: "Order ID atau link",
    placeholder: "Masukkan Order ID atau tempel link order",
    button: "Gabung",
    error_required: "Masukkan Order ID atau link order.",
  },

  order_detail: {
    share_title: "Group Order",
    copy_link: "Salin link",
    share_link: "Bagikan link",
    you: "Kamu",
    note: "Catatan:",
    empty: "Belum ada pesanan. Jadilah yang pertama menambahkan pesanan!",

    recap: {
      title: "Rekap Order",
      owner_only: "Hanya terlihat oleh pembuat order",
      total: "Total item",
      participants: "Per peserta",
      copy: "Salin rekap",
      copied: "Tersalin",
    },

    add_item: {
      form: {
        title: "Tambah Pesananmu",
        edit_title: "Ubah Pesananmu",

        participantName: {
          label: "Nama kamu",
          placeholder: "Masukkan nama kamu",
        },

        items: {
          label: "Item",
          placeholder: "Masukkan nama item",
        },

        quantity: {
          label: "Jumlah",
        },

        note: {
          label: "Catatan",
          placeholder: "Masukkan catatan",
        },

        button: {
          add_item: "Tambah Item",
          confirm: "Simpan",
          cancel: "Batal",
        },
      },

      notification_add_item: {
        success: "Berhasil menambahkan pesananmu ke order.",
        error: "Gagal menambahkan pesananmu, silakan coba lagi nanti.",
        closed: "Order ini sudah ditutup, batas waktu order telah lewat.",
        full: "Order ini sudah mencapai batas maksimal peserta.",
      },
    },
  },
}
