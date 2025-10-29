// Menunggu semua konten HTML dimuat sebelum menjalankan script
document.addEventListener('DOMContentLoaded', () => {

    // Fungsi untuk memformat angka menjadi Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    // ==========================================================
    // SCRIPT UNTUK HALAMAN PRODUK (produk.html)
    // ==========================================================
    const orderForm = document.getElementById('order-form');

    if (orderForm) {
        const nominalGrid = document.getElementById('nominal-grid');
        const priceDisplay = document.getElementById('total-price');

        // Fungsi untuk update harga di Halaman Produk
        nominalGrid.addEventListener('change', (event) => {
            if (event.target.type === 'radio' && event.target.name === 'nominal') {
                const price = parseInt(event.target.dataset.price, 10);
                priceDisplay.textContent = formatRupiah(price);
            }
        });

        // Fungsi saat form produk di-submit
        orderForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Mencegah form reload halaman

            // Ambil semua data yang dipilih
            const userId = document.getElementById('user_id').value;
            const zoneId = document.getElementById('zone_id').value;

            const selectedNominal = document.querySelector('input[name="nominal"]:checked');
            const selectedPayment = document.querySelector('input[name="payment"]:checked');

            // Validasi
            if (!userId || !zoneId) {
                alert('Harap isi User ID dan Zone ID Anda.');
                return;
            }
            if (!selectedNominal) {
                alert('Harap pilih nominal top up.');
                return;
            }
            if (!selectedPayment) {
                alert('Harap pilih metode pembayaran.');
                return;
            }

            // Kumpulkan data dalam satu objek
            const orderData = {
                userId: `${userId} (${zoneId})`,
                productName: selectedNominal.dataset.name,
                paymentName: selectedPayment.dataset.name,
                price: parseInt(selectedNominal.dataset.price, 10),
                priceFormatted: formatRupiah(selectedNominal.dataset.price)
            };

            // Simpan data ke localStorage untuk dibawa ke halaman checkout
            // JSON.stringify mengubah objek menjadi teks
            localStorage.setItem('currentOrder', JSON.stringify(orderData));

            // Arahkan pengguna ke halaman checkout
            window.location.href = '../payment.html';
        });
    }

    // ==========================================================
    // SCRIPT UNTUK HALAMAN CHECKOUT (checkout.html)
    // ==========================================================
    const checkoutPage = document.getElementById('checkout-page');

    if (checkoutPage) {
        // Ambil data dari localStorage
        // JSON.parse mengubah teks kembali menjadi objek
        const orderData = JSON.parse(localStorage.getItem('currentOrder'));

        // Jika tidak ada data (misal user langsung ke checkout.html), lempar ke home
        if (!orderData) {
            alert('Anda belum memilih produk.');
            window.location.href = 'index.html';
            return;
        }

        // Isi detail pesanan di kolom kiri
        document.getElementById('summary-user-id').textContent = orderData.userId;
        document.getElementById('summary-product').textContent = orderData.productName;
        document.getElementById('summary-payment').textContent = orderData.paymentName;
        document.getElementById('summary-total-price').textContent = orderData.priceFormatted;

        // Proses form data diri (kolom kanan)
        const checkoutForm = document.getElementById('checkout-form');
        checkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();

            // Ambil data kontak
            const fullName = document.getElementById('full_name').value;
            const contact = document.getElementById('contact').value;

            // Tambahkan data kontak ke objek orderData
            orderData.customerName = fullName;
            orderData.customerContact = contact;

            // Simpan lagi data yang SUDAH LENGKAP ke localStorage
            localStorage.setItem('currentOrder', JSON.stringify(orderData));

            // Arahkan ke halaman pembayaran
            window.location.href = 'pembayaran.html';
        });
    }

    // ==========================================================
    // SCRIPT UNTUK HALAMAN PEMBAYARAN (pembayaran.html)
    // ==========================================================
    const paymentPage = document.getElementById('payment-page');

    if (paymentPage) {
        // Ambil data LENGKAP dari localStorage
        const orderData = JSON.parse(localStorage.getItem('currentOrder'));

        // Jika data tidak ada, lempar ke home
        if (!orderData) {
            window.location.href = 'index.html';
            return;
        }

        // Tampilkan semua data di halaman gimmick
        document.getElementById('payment-method-title').textContent = orderData.paymentName;
        document.getElementById('summary-name').textContent = orderData.customerName;
        document.getElementById('summary-contact').textContent = orderData.customerContact;
        document.getElementById('summary-total-price').textContent = orderData.priceFormatted;

        // (Opsional) Hapus data dari localStorage agar tidak nyangkut
        // localStorage.removeItem('currentOrder'); 
        // -> Sebaiknya dihapus saat user menekan tombol 'Selesai' atau setelah timeout
    }

    // ==========================================================
    // SCRIPT BARU UNTUK FITUR SEARCH DI INDEX.HTML
    // ==========================================================
    const searchInput = document.getElementById('search-input');
    const gameListContainer = document.getElementById('game-list-container');

    // Kita cek dulu apakah kita di halaman index (yang ada search bar & daftar game)
    if (searchInput && gameListContainer) {

        // Ini adalah "mata-mata" yang berjalan setiap kali Anda mengetik
        searchInput.addEventListener('input', () => {
            
            // 1. Ambil apa yang diketik user, ubah jadi huruf kecil
            const query = searchInput.value.toLowerCase();
            
            // 2. Ambil semua kartu game yang ada di dalam kontainer
            const allGames = gameListContainer.querySelectorAll('.game-card');

            // 3. Loop (periksa) setiap kartu game satu per satu
            allGames.forEach(game => {
                
                // 4. Ambil teks judul dari game (misal: "Mobile Legends")
                //    Gunakan .game-overlay-title JIKA Anda pakai desain blur,
                //    Gunakan .game-title JIKA Anda pakai desain hopestore.id
                const titleElement = game.querySelector('.game-title'); // <-- Sesuaikan ini jika perlu
                const title = titleElement.textContent.toLowerCase();

                // 5. Inti Logika:
                //    Jika judul game mengandung teks yang diketik user...
                if (title.includes(query)) {
                    game.style.display = 'block'; // ...tampilkan kartu game
                } else {
                    game.style.display = 'none'; // ...sembunyikan kartu game
                }
            });
        });

        // (Opsional) Mencegah tombol "Cari" me-reload halaman
        const searchButton = document.querySelector('.search-bar button');
        if (searchButton) {
            searchButton.addEventListener('click', (e) => {
                e.preventDefault(); // Mencegah aksi default tombol
            });
        }
    }

});