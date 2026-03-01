// 1. ربط الاتصال بـ Supabase
const { createClient } = supabase;

// تصحيح الرابط (زدنا علامات التنصيص '')
const supabaseUrl = 'https://irfxrvincoaacwpialqp.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZnhydmluY29hYWN3cGlhbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzIzMTYsImV4cCI6MjA4NjQwODMxNn0.o7GlOpeUoSl5aRmkZSKGhglIsYUMxmTEDtMswCJkQac';

const _supabase = createClient(supabaseUrl, supabaseKey);

// 2. تفعيل الكود بعد تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', () => {
    
    // ربط زر البحث في صفحة Prüfen
    const checkBtn = document.getElementById('check-btn');
    if (checkBtn) {
        checkBtn.addEventListener('click', checkNumber);
    }

    // ربط الأزرار ديال Navigation (باش تبدل بين الصفحات)
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const pageId = btn.getAttribute('data-page') + '-page';
            
            // إخفاء كاع الصفحات
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            // إظهار الصفحة اللي تبركت
            document.getElementById(pageId).classList.add('active');
            
            // تحديث حالة الأزرار
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});

// 3. الفانكشن الرئيسية للبحث
async function checkNumber() {
    const phoneInput = document.getElementById('phone-input');
    const number = phoneInput.value.trim();
    const loadingOverlay = document.getElementById('loading');
    const resultDiv = document.getElementById('check-result');

    if (!number) {
        alert('Bitte geben Sie eine Telefonnummer ein');
        return;
    }

    loadingOverlay.classList.remove('hidden');
    resultDiv.classList.add('hidden');

    try {
        const { data, error } = await _supabase
            .from('fraud_numbers')
            .select('*')
            .eq('phone', number)
            .maybeSingle();

        if (error) throw error;
        renderUI(data);
    } catch (err) {
        console.error('Error fetching data:', err);
        alert('Fehler: ' + err.message);
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

// 4. تحديث الواجهة
function renderUI(data) {
    const resultDiv = document.getElementById('check-result');
    const statusBox = resultDiv.querySelector('.result-status');
    const title = resultDiv.querySelector('.result-title');
    const reason = resultDiv.querySelector('.result-reason');
    const category = resultDiv.querySelector('.result-category');
    const action = resultDiv.querySelector('.result-action');

    resultDiv.classList.remove('hidden');

    if (data) {
        statusBox.className = 'result-status danger';
        statusBox.textContent = '🚨 BETRUG BESTÄTIGT';
        title.textContent = 'Achtung: Verdächtig!';
        reason.textContent = 'Diese Nummer wurde bereits gemeldet.';
        category.innerHTML = `<strong>Kategorie:</strong> ${data.category} <br> <strong>Meldungen:</strong> ${data.reports_count}`;
        action.textContent = '⚠️ SOFORT AUFLEGEN!';
    } else {
        statusBox.className = 'result-status safe';
        statusBox.textContent = '✅ SICHER';
        title.textContent = 'Keine Warnung';
        reason.textContent = 'Diese Nummer ist uns nicht als Betrug bekannt.';
        category.textContent = 'Stand: Aktuell';
        action.textContent = 'Sie können den Anruf annehmen.';
    }
}
