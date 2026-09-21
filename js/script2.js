(function () {
	// Isi dengan selector isi artikel di halaman detail jika ingin
	// menampilkan cuplikan otomatis, contoh: '.artikel-content'.
	// Biarkan null jika tidak diperlukan.
	const CONTENT_SELECTOR = '.artikel-content';
	const EXCERPT_LENGTH = 280;

	const dlg = document.getElementById('beritaModal');
	const el = {
		img: document.getElementById('bmImg'),
		label: document.getElementById('bmLabel'),
		title: document.getElementById('bmTitle'),
		date: document.getElementById('bmDate'),
		views: document.getElementById('bmViews'),
		excerpt: document.getElementById('bmExcerpt'),
		link: document.getElementById('bmLink')
	};
	let controller = null;

    function openModal(d) {
	el.img.src = d.img;
	el.img.alt = d.title;
	el.label.textContent = d.label;
	el.title.textContent = d.title;
	el.date.textContent = d.date;
	el.views.textContent = d.views ? d.views + ' dilihat' : '';
	el.excerpt.textContent = '';
	el.link.href = d.url;

	// Penyesuaian posisi tengah via JS
	Object.assign(dlg.style, {
		position: 'fixed',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		margin: '0'
	});

	dlg.showModal();
	document.body.style.overflow = 'hidden';
	loadExcerpt(d.url);
}

	// Ambil data langsung dari kartu yang diklik
	function readCard(card, anchor) {
		const img = card.querySelector('.berita-img-holder img');
		const text = (sel) => {
		const node = card.querySelector(sel);
		return node ? node.textContent.trim() : '';
		};
		return {
		url: anchor.href,
		// alt berisi judul lengkap, sedangkan h5 dipotong "..."
		title: (img && img.alt) || text('.berita-item-title'),
		img: img ? (img.currentSrc || img.src) : '',
		label: text('.berita-badge-label'),
		date: text('.fa-calendar-alt') || (card.querySelector('.fa-calendar-alt')?.parentElement.textContent.trim() ?? ''),
		views: card.querySelector('.fa-eye')?.parentElement.textContent.trim() ?? ''
		};
	}

	function openModal(d) {
		el.img.src = d.img;
		el.img.alt = d.title;
		el.label.textContent = d.label;
		el.title.textContent = d.title;
		el.date.textContent = d.date;
		el.views.textContent = d.views ? d.views + ' dilihat' : '';
		el.excerpt.textContent = '';
		el.link.href = d.url;
		dlg.showModal();
		document.body.style.overflow = 'hidden';
		loadExcerpt(d.url);
	}

	// Opsional: ambil cuplikan dari halaman detail (domain sama, jadi tidak kena CORS)
	async function loadExcerpt(url) {
		if (!CONTENT_SELECTOR) return;
		controller = new AbortController();
		try {
		const res = await fetch(url, { signal: controller.signal });
		const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
		const node = doc.querySelector(CONTENT_SELECTOR);
		if (node) {
			const t = node.textContent.replace(/\s+/g, ' ').trim();
			el.excerpt.textContent = t.length > EXCERPT_LENGTH ? t.slice(0, EXCERPT_LENGTH) + '...' : t;
		}
		} catch (e) { /* diabaikan: popup tetap jalan tanpa cuplikan */ }
	}

	function closeModal() {
		if (controller) controller.abort();
		if (dlg.open) dlg.close();
	}

	// Event delegation: kartu yang dimuat belakangan (AJAX / pagination) tetap berfungsi
	document.addEventListener('click', function (e) {
		const card = e.target.closest('.berita-grid-card');
		if (!card) return;
		const anchor = card.closest('a');
		if (!anchor) return;
		// Biarkan ctrl/cmd/shift + klik membuka tab baru seperti biasa
		if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
		e.preventDefault();
		openModal(readCard(card, anchor));
	});

	// Tutup: tombol X, klik area gelap, atau tombol Esc (bawaan <dialog>)
	dlg.addEventListener('click', function (e) {
		if (e.target === dlg || e.target.closest('[data-bm-close]')) closeModal();
	});
	dlg.addEventListener('close', function () {
		document.body.style.overflow = '';
		if (controller) controller.abort();
	});
	})();