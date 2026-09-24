import Dexie, { type Table } from "dexie"

import type { Agent } from "@/modules/app/agents/types/agent"
import type { Agency } from "@/modules/app/agencies/types/agency"
import type { Transaction } from "@/modules/app/transactions/types/transaction"

export class AmarHisabDatabase extends Dexie {
  agents!: Table<Agent, string>
  agencies!: Table<Agency, string>
  transactions!: Table<Transaction, string>

  constructor() {
    super("amarhisab")

    this.version(1).stores({
      agents: "id, sl, name, is_active, created_at",
      agencies: "id, sl, name, is_active, created_at",
      transactions:
        "id, transaction_group_id, root_transaction_id, type, transaction_date, party_type, agent_id, agency_id, is_active, created_at",
    })
  }
}

export const db = new AmarHisabDatabase()