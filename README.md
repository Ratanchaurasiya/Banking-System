# HexChal Digital Bank

HexChal Digital Bank is a browser-based banking management project built with HTML, CSS, and vanilla JavaScript. It provides two role-based portals: a customer portal for everyday banking operations and a staff/admin portal for branch-style account management, transaction handling, loan reviews, and reporting.

The application runs directly in the browser and stores demo data in `localStorage`, so it does not require a backend server or database.

## Table of Contents

- [Overview](#overview)
- [Live Demo Setup](#live-demo-setup)
- [Login Credentials](#login-credentials)
- [Project Features](#project-features)
- [Customer Portal Features](#customer-portal-features)
- [Staff Portal Features](#staff-portal-features)
- [Security and Validation Features](#security-and-validation-features)
- [Reports and Exports](#reports-and-exports)
- [Data Storage](#data-storage)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [How to Use](#how-to-use)
- [Sample Data](#sample-data)
- [Project Enhancement Summary](#project-enhancement-summary)
- [Limitations](#limitations)
- [Future Enhancements](#future-enhancements)

## Overview

This project simulates a digital banking system with account creation, login, money deposit, withdrawal, fund transfer, bill payment, loan application, debit card management, reports, and staff review workflows.

It is designed as a front-end project and is useful for learning:

- DOM manipulation
- Form validation
- Role-based UI rendering
- Local browser storage
- Transaction flow handling
- Report generation
- Chart rendering
- PDF and CSV export

## Live Demo Setup

No installation is required.

1. Download or clone the project.
2. Open the project folder.
3. Open `index.html` in any modern browser.

Recommended browsers:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox

Because the project uses CDN libraries for charts, PDF export, icons, and fonts, an internet connection is recommended for the complete UI experience.

## Login Credentials

### Staff Login

Use these default staff credentials:

```text
Username: admin
Password: ad*****
```

### Customer Login

The application loads sample customer accounts on first use:

```text
Account Number: 10001
PIN: 1234
```

```text
Account Number: 10002
PIN: 5678
```

Customers can also register a new account from the login screen.

## Project Features

- Customer and staff authentication flows
- Role-based dashboard and sidebar navigation
- Customer account registration
- Staff account opening workflow
- Savings and current account support
- Account search and account directory
- Account editing and account closing
- Deposit, withdrawal, and fund transfer operations
- OTP-based transfer confirmation
- Utility bill payment
- Loan application and EMI calculation
- Staff loan approval and rejection queue
- Virtual debit card display
- Card freeze/unfreeze controls
- ATM and online transaction limit management
- PIN change and PIN reset support
- Account locking after repeated incorrect PIN attempts
- Customer statements and staff reports
- Chart-based report summaries
- In-app notification center
- Staff audit trail for recent banking actions
- PDF statement/report download
- CSV account export
- Printable account opening receipt
- Light and dark theme toggle
- Progressive Web App metadata and local app-shell caching
- Demo data stored in browser `localStorage`

## Customer Portal Features

After logging in as a customer, users can access these features:

### Customer Dashboard

- View account holder profile
- View account number and account type
- View phone number, email, Aadhaar, address, and account status
- View available balance
- View virtual debit card details
- View recent transactions

### Send Money

- Transfer funds to another account
- Sender account is auto-filled for logged-in customers
- Receiver name is auto-filled when a valid account number is entered
- Supports transfer modes such as IMPS, NEFT, RTGS, and UPI
- Requires the sender PIN
- Generates a demo 6-digit OTP
- Requires OTP verification before completing the transfer
- Records both outgoing and incoming transaction entries

### Utility Bill Payment

Customers can pay:

- Electricity bills
- Mobile recharge/postpaid bills
- DTH recharge
- Water bills

Bill payment includes:

- Dynamic provider list based on bill type
- Consumer number or subscriber number input
- PIN verification
- Balance check
- Online transaction limit check
- Receipt-style success message
- Transaction history entry

### Loan Application

Customers can:

- Apply for personal, home, car, business, or education loans
- Enter loan amount, tenure, income, employment type, and purpose
- Calculate EMI before applying
- View total interest and total repayment
- Submit loan application for staff review

### Card Settings

Customers can:

- View virtual debit card number, holder name, and expiry
- Freeze or unfreeze the card
- Set daily ATM withdrawal limit
- Set daily online transaction limit

Card settings affect ATM withdrawals, online transfers, and bill payments.

### Profile Settings

Customers can:

- Change their 4-digit account PIN
- Verify old PIN before setting a new PIN
- Confirm the new PIN before saving

### My Statements

Customers can:

- Generate account statements
- View money-in and money-out summaries
- View transaction tables
- View charts
- Download statements as PDF

## Staff Portal Features

After logging in as staff, administrators can access these features:

### Bank Dashboard

The staff dashboard shows:

- Total deposits across all accounts
- Number of active accounts
- Number of locked accounts
- Number of loan applications
- Recent system transactions
- Quick account search

### Open Account

Staff can create new accounts with:

- Full name
- Father's name
- Phone number
- Email address
- Aadhaar number
- 4-digit PIN
- Account type
- Initial deposit
- Address
- Optional customer photo upload

After account creation:

- A new account number is generated
- A virtual debit card is assigned
- Initial deposit is recorded as a transaction
- Account opening summary is displayed
- Account summary can be printed

### Accounts Directory

Staff can:

- View all accounts
- Search accounts by name, account number, phone, or email
- Filter accounts by active or locked status
- Export account list as CSV
- Edit account details
- Reset account PIN
- Change account status
- Close/delete an account

Account closing is blocked if the account still has a positive balance.

### Search Account

Staff can search an account by account number and view:

- Account holder details
- Contact details
- Aadhaar number
- Account type
- Current balance
- Account status
- Account creation date

Quick actions are available for:

- Deposit
- Withdrawal
- Transfer

### Cash Counter / Deposit

Staff can deposit money into an account using:

- Cash
- Cheque
- Online transfer

The system validates the account and amount, updates balance, and records the transaction.

### Cash Withdrawal

Staff can process withdrawals with:

- Account number
- Auto-filled account holder name
- Auto-filled current balance
- Withdrawal amount
- Withdrawal mode
- 4-digit PIN
- Optional purpose

The system checks:

- Account existence
- Account lock status
- PIN correctness
- Available balance
- Card block status for ATM withdrawals
- ATM withdrawal limit

### Fund Transfer

Staff can initiate transfers between any valid accounts. The flow includes:

- Sender and receiver account validation
- Auto-filled sender and receiver names
- Amount validation
- PIN verification
- Online transfer limit check
- OTP generation
- OTP confirmation
- Transaction entries for both accounts

### Loan Review Queue

Staff can:

- View pending loan applications
- See application ID, account number, applicant name, loan type, amount, EMI, and income
- Approve loan applications
- Reject loan applications

When a loan is approved:

- Loan status changes to approved
- Loan amount is credited to the customer's account
- A transaction entry is created

### General Reports

Staff can generate:

- Account statements
- All transactions summary
- Loan status reports

Reports include charts, summary statistics, tables, and PDF export.

### Audit Trail

Staff can review recent local system activity, including logins, transactions, loan decisions, account updates, card limit changes, and logout events. Audit entries are stored in browser `localStorage` and can be cleared from the Audit Trail screen.

### Support Desk

The project includes a support section with:

- Support manager details
- General support phone and email
- Support availability information
- Bank address placeholder

## Security and Validation Features

This is a front-end simulation, but it includes several application-level safety checks:

- Customer and staff login separation
- PIN-based customer authentication
- PIN hashing before storage
- Account lock after 3 failed PIN attempts
- Locked account access prevention
- Phone number validation
- Email format validation
- Aadhaar length validation
- 4-digit PIN validation
- Positive amount validation
- Balance check before withdrawal, transfer, and bill payment
- Same-account transfer prevention
- OTP confirmation before transfer completion
- Card freeze support
- ATM and online transaction limit checks
- Account deletion blocked while balance is positive
- Local audit trail for important account and transaction actions
- In-app notifications for success, warning, and error events

Important: This project is for educational/demo use only. It is not production-grade banking software.

## Reports and Exports

The system supports multiple reporting formats:

### Account Statement

- Account holder details
- Current balance
- Total money in
- Total money out
- Transaction table
- Pie chart
- PDF export

### Global Transactions Report

- Total deposits
- Total withdrawals and bill payments
- Total transfer volume
- Total number of transactions
- Bar chart
- PDF export

### Loan Status Report

- Total loan applications
- Pending applications
- Approved applications
- Rejected applications
- Total loan value requested
- Doughnut chart
- PDF export

### CSV Export

Staff can export the accounts directory as a CSV file containing:

- Account number
- Name
- Father's name
- Phone
- Email
- Account type
- Balance
- Status

## Data Storage

The project stores data in the browser using `localStorage`.

Stored keys include:

- `bankAccounts`
- `bankTransactions`
- `bankLoans`
- `bankNotifications`
- `bankAuditTrail`

If browser storage is unavailable, the app falls back to in-memory storage for the current session.

To reset the demo data:

1. Open browser developer tools.
2. Go to Application or Storage.
3. Clear local storage for the project.
4. Refresh the page.

The app will reload the default sample accounts.

## Project Structure

```text
Banking-System-main
|-- index.html              Main HTML entry point
|-- README.md               Project documentation
|-- app.js                  Routing, section switching, modals, and global handlers
|-- bank.js                 Core banking data model and business logic
|-- auth.js                 Customer/staff login and registration logic
|-- dashboard.js            Customer and staff dashboard rendering
|-- transactions.js         Deposit, withdrawal, transfer, OTP, and bill payment flows
|-- loans.js                Loan application, EMI calculation, approval, and rejection
|-- cards.js                Debit card settings, card lock, limits, and PIN change
|-- reports.js              Statements, charts, and PDF report exports
|-- utils.js                Shared helpers, messages, photo preview, and OTP inputs
|-- authTemplate.js         Login and registration HTML template
|-- sidebarTemplate.js      Role-based sidebar template
|-- sectionsTemplate.js     Main application section templates
|-- modalsTemplate.js       Edit/delete account modal templates
|-- base.css                Global variables, typography, and base styling
|-- layout.css              Main layout and sidebar styling
|-- components.css          Buttons, forms, tables, cards, modals, and reusable UI
|-- dashboard.css           Dashboard-specific styles
|-- auth.css                Login and authentication page styling
|-- manifest.json           PWA manifest metadata
|-- service-worker.js       App-shell cache service worker
`-- icon.svg                PWA application icon
```

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage`
- Font Awesome icons
- Google Fonts
- Chart.js
- jsPDF
- jsPDF AutoTable
- Web App Manifest
- Service Worker API

## How to Use

### As a Customer

1. Open `index.html`.
2. Select Customer Login.
3. Log in with a sample account or register a new account.
4. Use the sidebar to access dashboard, transfers, bill payments, loans, cards, statements, and settings.

### As Staff

1. Open `index.html`.
2. Select Staff Login.
3. Log in with `admin` and `admin123`.
4. Use the sidebar to manage accounts, deposits, withdrawals, transfers, loans, reports, and support.

## Sample Data

The project starts with two sample accounts:

| Account No | Name | Type | Balance | PIN |
| --- | --- | --- | --- | --- |
| 10001 | Rajesh Kumar | Savings | Rs. 35,000 | 1234 |
| 10002 | Priya Sharma | Current | Rs. 83,000 | 5678 |

Sample transactions are also created for deposits, withdrawals, and transfers.

## Project Enhancement Summary

HexChal Digital Bank is designed as a feature-rich banking simulation, with opportunities for further enhancement in both functionality and user experience. Future improvements may include advanced transaction management, beneficiary registration, real-time notifications, detailed financial analytics, and enhanced reporting dashboards. Additional banking modules such as fixed deposits, recurring deposits, investment tracking, and loan repayment management can expand the system's capabilities.

To improve security and scalability, future versions can incorporate backend integration, database connectivity, secure authentication, encrypted data storage, email and SMS verification, and comprehensive audit logs. Enhancements such as responsive mobile support, Progressive Web App (PWA) functionality, automated testing, and AI-powered fraud monitoring would further modernize the platform and align it with real-world digital banking standards.

## Limitations

- Data is stored only in the browser.
- There is no backend server or real database.
- Staff credentials are hardcoded for demo purposes.
- OTP is displayed on screen for demonstration.
- PIN hashing is simple and not suitable for production security.
- PDF and chart features depend on external CDN libraries.
- The app is intended for education, practice, and demonstration only.

## Future Enhancements

Possible improvements include:

- Backend API integration
- Real database support
- Secure staff authentication
- Password reset flow
- Real OTP delivery by SMS or email
- Transaction receipts with unique IDs
- Advanced account filters
- Customer document upload
- Loan repayment schedule
- Role-based staff permissions
- Audit logs
- Responsive mobile refinements
- Automated tests

## Author

Developed as a HexChal Digital Bank front-end project.

