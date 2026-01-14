# Functional Requirements Document (FRD)
**Product:** Houlnd Realty

## 1. Introduction
This document details the functional specifications for the Houlnd Realty platform. It translates the high-level business requirements (Zero Brokerage, Gated Access, Precision Filtering) into specific system behaviors, inputs, and outputs. The core focus is on the "Must Have" MVP features required to launch the Customer and Promoter portals.

## 2. User Roles & Permissions
*   **Promoter (Seller):** Can post properties, manage availability, view leads, and must sign commission agreements. Restricted from viewing other sellers' contact info without acting as a buyer.
*   **Customer (Buyer):** Can search, filter (specifically by Sq.ft price), view map locations, schedule visits, and pay to unlock seller details.
*   **Admin:** (Implied) Backend role to verify documents and approve/reject listings based on litigation/broker checks.

## 3. Functional Modules

### 3.1 Module: User Authentication & Profile
**F3.1.1 Registration & Login**
*   **Description:** Users must be able to create accounts via separate portals for Customers and Promoters.
*   **Input:** Email, Phone Number, OTP Verification.
*   **System Logic:**
    *   The system must verify the phone number via OTP to ensure genuine identity.
    *   Users can have a dual profile but must toggle between "Buying" and "Selling" modes if applicable.

### 3.2 Module: Promoter Portal (Supply Side)
**F3.2.1 Create Listing (Property Details)**
*   **Description:** Promoters interact with a posting form to submit property data.
*   **Data Inputs:**
    *   *Property Type:* Plot or Apartment.
    *   *Budget:* Total expected price.
    *   *Pricing Logic:* Fixed vs. Negotiable (Radio button selection).
    *   *Amenities:* List of amenities and "Amenities Price" breakdown.
    *   *Availability:* "Time to Visit" slots (Calendar/Time picker).
*   **Constraint:** The listing cannot be published immediately; it enters a "Pending Verification" state.

**F3.2.2 Commission Agreement (Free Posting)**
*   **Description:** Although posting is free, the system must enforce a digital agreement.
*   **Functional Flow:**
    *   Before final submission, the system displays the "Commission on Sale" agreement.
    *   Promoter must check "I Agree" to proceed.
    *   System records the timestamp and acceptance of terms.

**F3.2.3 Privacy Management**
*   **Description:** The Promoter's phone number is masked by default.
*   **System Logic:** The database stores the contact number but the API does not return this field to the frontend Customer App until a specific "Unlock" event is triggered.

### 3.3 Module: Customer Portal (Discovery)
**F3.3.1 Sq.ft Price Filter (Core Feature)**
*   **Description:** The search interface must prioritize "Price per Sq.ft" as the main filter.
*   **Input:** Range Slider or Input Fields (Min/Max).
*   **Example Logic:** User selects "999 to 19999".
*   **System Processing:** Database query filters properties where `(Total Price / Total Sq.ft)` falls within the selected range.
*   **Output:** List of matching properties (Plots or Apartments).

**F3.3.2 Map View Integration**
*   **Description:** Users can view search results on an interactive map.
*   **Input:** User geolocation or searched city.
*   **Output:** Map pins showing property locations.
*   **Constraint:** Exact building number/address may be obfuscated until unlock (depending on privacy settings), but general location is visible.

**F3.3.3 Shortlist & Cart**
*   **Description:** Users can save properties for later review.
*   **Action:** Click "Shortlist" or "Add to Cart" icon.
*   **System Logic:** Adds the `Property_ID` to the user's `Saved_Items` table.

### 3.4 Module: Monetization & Gated Access
**F3.4.1 Contact Unlock (The "Pay to Open" Feature)**
*   **Description:** The seller's phone number is hidden until the customer pays.
*   **Trigger:** Customer clicks "Contact Seller" or "Unlock Details."
*   **System Flow:**
    1.  System checks if user has already unlocked this property.
    2.  If NO: Redirect to Payment Gateway.
    3.  If Payment = Success: System updates user record (`Unlock_Purchased`) and reveals the `Promoter_Phone_Number`.
    4.  Notification sent to Promoter: "A customer has unlocked your contact details".

### 3.5 Module: Appointment Scheduling
**F3.5.1 Schedule Visit**
*   **Description:** Integrated calendar tool for site visits.
*   **Input:** Customer selects a date/time from the Promoter's "Time to Visit" availability.
*   **System Logic:**
    *   Check slot availability.
    *   Book slot (Tentative or Confirmed).
    *   Send confirmation notification (SMS/In-App) to both parties.

### 3.6 Module: Trust & Integrity (Backend)
**F3.6.1 Verification Workflow**
*   **Description:** Mandatory review to prevent fake/litigated listings.
*   **Input:** Listing Data + Proof of Ownership/ID.
*   **Process:**
    *   Admin reviews documents against litigation databases.
    *   *Check:* Is this a broker? (If yes -> Reject).
    *   *Check:* Is property litigated? (If yes -> Reject).
*   **Output:** Status update to "Verified/Live" or "Rejected".

## 4. System Interfaces & UI Guidelines
*   **Customer App:** Focused on the "Sq.ft Price" filter as the primary UI element on the home screen.
*   **Promoter Dashboard:** Focused on lead management and visibility into who has "unlocked" their profile.

## 5. Non-Functional Requirements (Specific to Functions)
*   **Data Masking:** API responses for property details **must not** include the `phone_number` field in the JSON payload unless the authentication token carries a "paid/unlocked" claim for that specific property ID.
*   **Latency:** The Sq.ft price calculation and filtering must happen in real-time (< 2 seconds) even with heavy datasets.
*   **Compliance:** Commission agreements must be digitally stored and retrievable for legal enforcement.

## 6. Future Scope (V2/V3 Provisions)
*   *Note:* The system architecture should support future integration of **Video Tours** and **AI Chatbots**, but these are disabled for the MVP FRS.