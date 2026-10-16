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

      extraFee: {
        label: "Ongkir / Biaya Tambahan (Rp)",
        hint: "Dibagi rata ke semua peserta",
      },

      paymentInfo: {
        label: "Info Pembayaran",
        placeholder: "Contoh: BCA 1234567890 a.n. Budi / GoPay 0812...",
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

    status: {
      open: "Dibuka",
      closed: "Ditutup",
    },

    payment: {
      paid: "Lunas",
      mark_paid: "Tandai lunas",
      mark_unpaid: "Batalkan lunas",
      to_pay: "Harus bayar",
      per_person: "per orang",
    },

    manage: {
      edit: "Edit order",
      edit_title: "Edit Order",
      save: "Simpan",
      close: "Tutup order",
      reopen: "Buka lagi",
      reopen_hint: "Ubah batas order ke waktu yang akan datang (Edit order) untuk membuka lagi.",
      leave: "Batal ikut",
      remove: "Keluarkan",
      confirm_leave: "Batal ikut order ini? Pesananmu akan dihapus.",
      confirm_remove: "Keluarkan peserta",

      notification: {
        updated: "Order berhasil diperbarui.",
        closed: "Order ditutup.",
        reopened: "Order dibuka lagi.",
        removed: "Peserta dikeluarkan dari order.",
        max_below_participants:
          "Maksimal peserta tidak boleh lebih kecil dari jumlah peserta yang sudah ikut.",
        error: "Terjadi kesalahan, silakan coba lagi nanti.",
      },
    },

    recap: {
      title: "Rekap Order",
      owner_only: "Hanya terlihat oleh pembuat order",
      total: "Total item",
      grand_total: "Total bayar",
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

        price: {
          label: "Harga satuan (Rp)",
          placeholder: "Harga",
          total: "Total",
        },

        note: {
          label: "Catatan",
          placeholder: "Masukkan catatan",
        },

        button: {
          add_item: "Tambah Item",
          confirm: "Simpan",
          remove_item: "Hapus item",
          cancel: "Batal",
        },
      },

      notification_add_item: {
        success: "Berhasil menambahkan pesananmu ke order.",
        error: "Gagal menambahkan pesananmu, silakan coba lagi nanti.",
        closed: "Order ini sudah ditutup.",
        full: "Order ini sudah mencapai batas maksimal peserta.",
      },
    },
  },
}
