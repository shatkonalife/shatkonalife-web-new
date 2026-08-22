const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// This runs 24/7 in the cloud whenever a new booking is added to Firestore
exports.sendBookingNotifications = functions.firestore
    .document("teleconsult_bookings/{bookingId}")
    .onCreate(async (snap, context) => {
        const booking = snap.data();
        
        const name = booking.name;
        const phone = booking.phone;
        const slot = booking.slot;
        const vector = booking.vector;
        const paymentId = booking.paymentId;

        // 1. Formatted Message for the Clinic Team
        const clinicMessage = 
            `🚨 *New Teleconsultation Booking!* 🏥\n\n` +
            `👤 *Name:* ${name}\n` +
            `📞 *Phone:* ${phone}\n` +
            `📌 *Slot:* ${slot}\n` +
            `⚡ *Vector:* ${vector} (Score: ${booking.score || 'N/A'})\n` +
            `💳 *Payment ID:* ${paymentId}`;
        
        // Uncomment once your WhatsApp API provider (Twilio, Interakt, WATI) is connected:
        // await sendWhatsAppMessage("919395503196", clinicMessage);

        // 2. Beautifully Polished Message for the User
        const userMessage = 
            `🌿 *ShatkonaLife | Tanman Physiotherapy Clinic* 🌿\n\n` +
            `Hello *${name}*, your teleconsultation booking is successfully confirmed! 🎉\n\n` +
            `📌 *Scheduled Slot:* ${slot}\n` +
            `⚡ *Focus Vector:* ${vector}\n` +
            `💳 *Payment Status:* Verified (ID: ${paymentId})\n\n` +
            `We have successfully reviewed your structural and mechanical load assessment. Our clinical specialist is looking forward to guiding you toward nervous system regulation and pain relief.\n\n` +
            `_Please keep a stable internet connection and be ready in a quiet space 5 minutes prior to your slot._\n\n` +
            `Warm regards,\n` +
            `*Clinical Team, Tanman Physiotherapy*`;
            
        // Uncomment once your WhatsApp API provider is connected:
        // await sendWhatsAppMessage(phone, userMessage);

        return null;
    });