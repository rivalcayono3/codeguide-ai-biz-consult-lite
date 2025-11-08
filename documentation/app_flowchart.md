flowchart TD
    A[Start] --> B[User visits landing page]
    B --> C{Authenticated?}
    C -->|No| D[Redirect to Login/Register]
    C -->|Yes| E[Show Dashboard]
    D --> F[Perform Login/Register]
    F --> C
    E --> G[Click New Analysis]
    G --> H[Fill Business Inputs Form]
    H --> I[Submit Form]
    I --> J[API Endpoint Save Inputs]
    J --> K[API Generate Report via AI]
    K --> L[API Save Analysis Report]
    L --> M[Return Report Status ID]
    M --> N[User Views Report]
    N --> O{Premium User?}
    O -->|Yes| P[Show Financial Dashboard]
    O -->|No| Q[Show Standard Report]
    E --> R{Expert Admin Access?}
    R -->|Yes| S[Show Expert Review Queue]
    S --> T[Select Report for Review]
    T --> U[Provide Feedback and Approve]
    U --> V[Update Report Status]
    V --> N