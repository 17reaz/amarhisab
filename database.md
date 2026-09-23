Transaction
├── id                    UUID
├── transaction_group_id  UUID nullable
├── root_transaction_id  UUID nullable
├── version_number       integer
├── is_active             boolean
├── replaced_transaction_id UUID nullable
│
├── type                  income | expense
├── amount                numeric
├── transaction_date      date
├── description           text
├── payment_method        cash | bkash | nagad | bank | other
├── reference_no          text
│
├── party_type            agent | agency
├── agent_id              UUID nullable
├── agency_id             UUID nullable
│
└── created_at             timestamptz