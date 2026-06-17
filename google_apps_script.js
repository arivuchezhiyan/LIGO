/**
 * LIGO Hospital - MASTER FORM HANDLER (Google Apps Script)
 * 1. Saves every lead to a Google Sheet ("Leads")
 * 2. Sends a professional Teal & Dark Teal themed email notification to the admins
 */

function doPost(e) {
  try {
    // 1. EXTRACT DATA FROM FORM (Matching index.html name attributes)
    var fullName = (e.parameter['fullName'] || "N/A").trim();
    var phone = (e.parameter['phone'] || "N/A").trim();
    var preferredDate = (e.parameter['preferredDate'] || "N/A").trim();
    var timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy, hh:mm a");

    // BASIC VALIDATION
    if (!fullName || !phone || fullName === "N/A" || phone === "N/A") {
      return ContentService.createTextOutput("Error: Missing Name or Phone").setMimeType(ContentService.MimeType.TEXT);
    }

    // --- PART A: SAVE TO GOOGLE SHEET ---
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("Leads") || ss.getSheets()[0];

      // Add a header row if the sheet is empty
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Patient Name", "Phone Number", "Preferred Date"]);
        // Styling headers with LIGO Hospital Teal (#00A0B1)
        sheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#00A0B1").setFontColor("white");
      }

      sheet.appendRow([timestamp, fullName, phone, preferredDate]);
    } catch (sheetError) {
      console.log("Sheet Logging Failed: " + sheetError.toString());
    }

    // --- PART B: SEND PROFESSIONAL EMAIL ---
    // Using LIGO Hospital Colors: Primary Teal (#00A0B1) and Dark Teal (#00495A)
    var emailBody =
      '<div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:20px;">' +
      '<div style="max-width:600px;margin:auto;background:#fff;padding:25px;border-radius:12px;border-top:5px solid #00A0B1;box-shadow: 0 4px 10px rgba(0,0,0,0.1);">' +
      '<div style="text-align:center;margin-bottom:20px;">' +
      '<h2 style="color:#00495A;margin:0;font-size:24px;">🏥 LIGO Hospital - New Consultation Enquiry</h2>' +
      '</div>' +
      '<hr style="border:0;border-top:1px solid #eee;margin-bottom:20px;">' +
      '<table style="width:100%;border-collapse:collapse;">' +
      row("Patient Name", fullName) +
      row("Phone Number", phone) +
      row("Preferred Date", preferredDate) +
      '</table>' +
      '<div style="margin-top:30px;padding-top:15px;border-top:1px solid #eee;text-align:center;">' +
      '<p style="font-size:12px;color:#999;">Submitted via LIGO Hospital Landing Page on: ' + timestamp + '</p>' +
      '</div>' +
      '</div></div>';

    var TO_EMAIL = (e.parameter['toEmail'] || "techsupport@kay.org.in").trim();
    var CC_EMAILS = (e.parameter['ccEmail'] || "").trim();

    var emailConfig = {
      to: TO_EMAIL,
      subject: "LIGO Hospital Gastroenterology Page - New Consultation Enquiry: " + fullName + " - " + preferredDate,
      htmlBody: emailBody,
      name: "LIGO Hospital Chennai"
    };

    if (CC_EMAILS) {
      emailConfig.cc = CC_EMAILS;
    }

    MailApp.sendEmail(emailConfig);

    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

// Helper function for email rows
function row(label, value) {
  return "<tr>" +
    "<td style='padding:12px 10px;border-bottom:1px solid #eee;font-weight:bold;color:#444;width:40%;font-size:14px;'>" + label + "</td>" +
    "<td style='padding:12px 10px;border-bottom:1px solid #eee;color:#222;font-size:14px;'>" + (value || "—") + "</td>" +
    "</tr>";
}
