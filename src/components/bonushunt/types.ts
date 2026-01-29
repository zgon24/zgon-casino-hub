export interface Slot {
  id: string;
  slot_name: string;
  bet_size: number;
  cost: number;
  result: number | null;
  status: "pending" | "opened";
  slot_order: number;
  image_url: string | null;
  is_super: boolean;
  is_extreme: boolean;
}

export interface BonusHunt {
  id: string;
  name: string;
  status: "active" | "completed";
  total_cost: number;
  total_result: number;
  created_at: string;
  start_amount: number;
  hunt_phase: "collecting" | "opening";
}
