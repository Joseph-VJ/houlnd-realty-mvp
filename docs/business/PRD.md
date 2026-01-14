# Product Requirements Document (PRD): Houlnd Realty

## 1. Background & Strategic Fit
The real estate market currently suffers from high brokerage fees (intermediation costs), a lack of trust due to fake/litigated listings, and inefficient search mechanisms where buyers struggle to compare value.

**Houlnd Realty** aims to disrupt this sector by eliminating brokers entirely and connecting Promoters (Sellers) directly with Customers (Buyers). The platform distinguishes itself through a "Gated Access Model" where seller contact details are monetized and protected, and a hyper-specific "Sq.ft Price" filtering system to aid precise decision-making.

## 2. Goals & Success Metrics
**Primary Goal:** Launch a trust-based, zero-brokerage marketplace that monetizes high-intent leads while providing granular price transparency.

**Success Metrics:**
*   **Monetization/Revenue:** Number of "Contact Unlocks" (Customers paying to view Seller details).
*   **Acquisition:** Number of Verified Promoter listings.
*   **Engagement:** Usage rate of the Sq.ft Price Filter (Primary USP).
*   **Trust:** 0% fake or litigated property reports post-verification.

## 3. User Personas
*   **The Promoter (Seller):** Property owner looking to sell without paying 20% brokerage. Wants to avoid spam calls and only deal with serious buyers. Willing to pay commission *only* upon successful sale.
*   **The Customer (Buyer):** Individual looking for plots or apartments. Frustrated by information asymmetry. Needs precise data (Price per Sq.ft) and assurance that listings are not litigated/fake.

## 4. Open Questions & Assumptions
*   *Open Question:* What is the specific payment gateway provider for the "Unlock" feature?
*   *Open Question:* What is the exact commission percentage agreed upon for the post-sale agreement?
*   *Assumption:* The product will launch as a Mobile App (primary for Customers) and Web Portal (primary for Promoters) given the mention of "Customer App" and "Portals".
*   *Assumption:* "Verification" implies manual or semi-automated backend review of documents before a listing goes live.

## 5. Scope
### In Scope (MVP / Must Have)
*   **Dual Portals:** Buyer Interface and Promoter (Seller) Interface.
*   **Search & Filter:** Advanced filtering specifically for Sq.ft Price (Range: 999 to 19999) and Location/Budget.
*   **Listing Management:** Form to post property details (Amenities, Fixed/Negotiable price).
*   **Monetization:** Gated contact system (Payment gateway integration to unlock seller number).
*   **Trust System:** Mandatory verification to prevent fake/broker/litigated listings.
*   **Appointment Scheduling:** Basic calendar tool for visits.

### Future Scope (Should/Could Have - V2/V3)
*   **V2:** Video Tour Player, Buyer Cart/Wishlist, "Show Interest" Notifications.
*   **V3:** AI Chatbots, AI Matching, Housing Loan Eligibility Tracker, Legal/Technical Opinion integrations.

### Out of Scope (Won't Have)
*   **Broker Postings:** Strict exclusion of agents.
*   **Direct Transaction Closure:** The platform facilitates the connection; it does not handle the legal ownership transfer or deed registration.
*   **Litigated Properties:** Any property with legal disputes is rejected.

## 6. Functional Requirements
Prioritization: **P0 (Critical/MVP)**, **P1 (High Priority/V1.x)**, **P2 (Nice to Have/V2)**.

### A. Authentication & User Profile
*   **[P0]** Users must be able to register/login as either "Promoter" or "Customer".
*   **[P0]** Identity verification (OTP/Email) is required to ensure genuine users.

### B. Promoter Portal (Supply Side)
*   **[P0]** **Create Listing:** Promoters must be able to input:
    *   Property Type (Plot/Apartment).
    *   Budget & Price Preference (Fixed vs. Negotiable).
    *   Amenities & Amenities Price.
    *   Time availability for visits.
*   **[P0]** **Free Posting Agreement:** Promoters must agree to pay a commission on sale to list for free.
*   **[P0]** **Privacy Control:** Promoter phone number must be hidden by default.

### C. Customer Portal (Demand Side)
*   **[P0]** **Sq.ft Price Filter:** Users must be able to filter properties by specific Price per Sq.ft (e.g., 999 - 19999).
*   **[P0]** **Map View:** Integration (e.g., Google Maps) to show property locations.
*   **[P0]** **Unlock Contact:** Users must be able to pay a fee to reveal the Promoter's phone number.
*   **[P0]** **Schedule Appointment:** Users can request a visit time based on Promoter availability.
*   **[P1]** **Shortlist:** Option to save/favorite properties.

### D. Trust & Safety
*   **[P0]** **Verification Workflow:** Backend system to approve/reject listings based on document/ID review (No fake/litigated properties).

## 7. User Stories
1.  **As a Customer,** I want to filter properties by "Price per Sq.ft" so that I can accurately compare the value of plots vs. apartments.
2.  **As a Promoter,** I want to post my property for free, so I don't have to pay upfront fees before finding a buyer.
3.  **As a Promoter,** I want my phone number hidden until a buyer pays, so I only receive calls from serious, high-intent leads.
4.  **As a Customer,** I want to schedule a visit through the app so I can coordinate without back-and-forth messaging.
5.  **As a Admin,** I want to verify listing documents to ensure no brokers or litigated properties enter the platform.

## 8. Non-Functional Requirements
*   **Data Privacy:** Seller contact information must be encrypted and not exposed in API responses until payment validation events occur.
*   **Performance:** Map view and Sq.ft filters must load results in <2 seconds.
*   **Integrity:** System must automatically flag potential duplicate listings to prevent spam.

## 9. Analytics & Events
*   **Listing Funnel:** `Listing_Started` -> `Details_Completed` -> `Agreement_Signed` -> `Listing_Submitted`.
*   **Search Metrics:** `Filter_Used_SqFt_Price`, `Map_View_Opened`.
*   **Monetization:** `Contact_Unlock_Initiated` -> `Payment_Success` -> `Contact_Revealed`.
*   **Engagement:** `Appointment_Scheduled`, `Property_Shortlisted`.

## 10. Dependencies & Integrations
*   **Payment Gateway:** Required for the "Pay to Open/Shortlist" feature.
*   **Map Service API:** Google Maps or equivalent for location visualization.
*   **SMS/Notification Service:** For OTPs, appointment reminders, and unlock alerts.

## 11. Risks & Mitigations
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Broker Infiltration** | High (Destroys USP) | Strict manual verification of documents; "Won't Have" policy for broker posting. |
| **Fake Listings** | High (Loss of Trust) | Mandatory ID review; listings are not live until verified. |
| **Low Inventory** | Medium | "Free Posting" incentive for sellers ensures low barrier to entry. |

## 12. Acceptance Criteria
*   **Gating:** The seller's phone number is **never** visible in the UI or page source until the payment confirmation signal is received.
*   **Filtering:** A search query for "1500 Sq.ft Price" returns *only* properties within that specific unit price range.
*   **Verification:** A listing cannot be published (Status: Live) without the backend "Verified" flag set to True.