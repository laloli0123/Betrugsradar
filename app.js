// 1. ربط الاتصال بـ Supabase
const { createClient } = supabase; // هادي جية من السطر اللي زدتي في HTML
const supabaseUrl = https://supabase.com/dashboard/project/irfxrvincoaacwpialqp/editor/17450
const supabaseKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZnhydmluY29hYWN3cGlhbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzIzMTYsImV4cCI6MjA4NjQwODMxNn0.o7GlOpeUoSl5aRmkZSKGhglIsYUMxmTEDtMswCJkQac
const _supabase = createClient(supabaseUrl, supabaseKey);

// 2. الفانكشن الرئيسية للبحث (Search Logic)
async function checkNumber() {
    const phoneInput = document.getElementById('phone-input');
    const number = phoneInput.value.trim();
    const loadingOverlay = document.getElementById('loading');
    const resultDiv = document.getElementById('check-result');

    if (!number) {
        alert('Bitte geben Sie eine Telefonnummer ein');
        return;
    }

    // إظهار اللودينغ
    loadingOverlay.classList.remove('hidden');
    resultDiv.classList.add('hidden');

    try {
        // البحث في جدول 'fraud_numbers' اللي كريتي في Supabase
        const { data, error } = await _supabase
            .from('fraud_numbers')
            .select('*')
            .eq('phone', number)
            .maybeSingle(); // كيجيب سطر واحد بضبط

        if (error) throw error;

        // عرض النتيجة
        renderUI(data);
    } catch (err) {
        console.error('Error fetching data:', err);
        alert('Fehler bei der Verbindung zur Datenbank');
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

// 3. تحديث الواجهة (Senior-Friendly UI)
function renderUI(data) {
    const resultDiv = document.getElementById('check-result');
    const statusBox = resultDiv.querySelector('.result-status');
    const title = resultDiv.querySelector('.result-title');
    const reason = resultDiv.querySelector('.result-reason');
    const category = resultDiv.querySelector('.result-category');
    const action = resultDiv.querySelector('.result-action');

    resultDiv.classList.remove('hidden');

    if (data) {
        // نمرة فيها خطر 🚨
        statusBox.className = 'result-status danger';
        statusBox.textContent = '🚨 BETRUG BESTÄTIGT';
        title.textContent = 'Achtung: Verdächtig!';
        reason.textContent = 'Diese Nummer wurde bereits gemeldet.';
        category.innerHTML = `<strong>Kategorie:</strong> ${data.category} <br> <strong>Meldungen:</strong> ${data.reports_count}`;
        action.textContent = '⚠️ SOFORT AUFLEGEN!';
    } else {
        // نمرة آمنة ✅
        statusBox.className = 'result-status safe';
        statusBox.textContent = '✅ SICHER';
        title.textContent = 'Keine Warnung';
        reason.textContent = 'Diese Nummer ist uns nicht als Betrug bekannt.';
        category.textContent = 'Stand: Aktuell';
        action.textContent = 'Sie können den Anruf annehmen.';
    }
}

// 4. ربط الأزرار (Event Listeners)
document.getElementById('check-btn').addEventListener('click', checkNumber);
