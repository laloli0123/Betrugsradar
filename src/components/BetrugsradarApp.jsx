import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. إعداد الاتصال بـ Supabase
// تأكد أن هاد السوارت كاينين في ملف .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BetrugsradarApp = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // 2. دالة التحقق من الرقم
    const checkNumber = async () => {
        if (!phoneNumber.trim()) {
            alert('Bitte geben Sie eine Telefonnummer ein'); // تنبيه إذا كانت الخانة فارغة
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            // البحث في جدول fraud_numbers
            const { data, error } = await supabase
                .from('fraud_numbers')
                .select('*')
                .eq('phone', phoneNumber.trim())
                .maybeSingle(); // كيرجع نتيجة واحدة أو null

            if (error) throw error;

            if (data) {
                // إذا وُجد الرقم في قائمة الاحتيال
                setResult({ ...data, isSafe: false });
            } else {
                // إذا لم يوجد الرقم (يعتبر آمن حالياً)
                setResult({ isSafe: true });
            }
        } catch (error) {
            console.error("Fehler bei der Datenbankabfrage:", error.message);
            alert('Ein Fehler است حدث أثناء الاتصال بالقاعدة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="check-page" className="page active">
            <div className="page-header">
                <h1>Nummer Prüfen</h1>
                <p className="subtitle">Ist diese Nummer verdächtig?</p>
            </div>
            
            <div className="check-container">
                <div className="input-group">
                    <label htmlFor="phone-input">Telefonnummer eingeben:</label>
                    <input 
                        type="tel" 
                        id="phone-input" 
                        placeholder="z.B. 030 1234567" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && checkNumber()}
                    />
                    <button 
                        onClick={checkNumber} 
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Prüfen...' : 'Nummer Prüfen'}
                        <span className="btn-icon">→</span>
                    </button>
                </div>

                {/* عرض النتائج بناءً على الحالة */}
                {result && (
                    <div id="check-result" className="check-result">
                        <div className="result-card">
                            {result.isSafe ? (
                                // حالة الرقم آمن
                                <>
                                    <div className="result-status safe">✅ SICHER</div>
                                    <div className="result-details">
                                        <h3 className="result-title">Keine Warnung</h3>
                                        <p className="result-reason">Diese Nummer ist uns noch nicht als Betrug bekannt.</p>
                                        <div className="result-category">Stand: Heute</div>
                                        <div className="result-action">Sie können den Anruf annehmen.</div>
                                    </div>
                                </>
                            ) : (
                                // حالة الرقم خطر (موجود في Supabase)
                                <>
                                    <div className="result-status danger">🚨 BETRUG BESTÄTIGT</div>
                                    <div className="result-details">
                                        <h3 className="result-title">Achtung: Verdächtig!</h3>
                                        <p className="result-reason">Diese Nummer wurde bereits gemeldet.</p>
                                        <div className="result-category">
                                            <strong>Kategorie:</strong> {result.category || 'Unbekannt'}
                                        </div>
                                        <div className="result-category">
                                            <strong>Meldungen:</strong> {result.reports_count || 0} Personen
                                        </div>
                                        <div className="result-action">⚠️ SOFORT AUFLEGEN!</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default BetrugsradarApp;
