"use client";

import { DISCOVR_PHONE, DISCOVR_PHONE_DISPLAY } from "@/shared/utils/discovrContact";
import { MessageIcon, PhoneIcon } from "./icons";
import { Sheet, SheetOption, SheetOptions } from "./Sheet";

export interface ContactSheetProps {
  open: boolean;
  onClose: () => void;
  /** E.164 */
  phone?: string;
  phoneDisplay?: string;
}

/** Opened by the Contact us tab. Copy is final. */
export function ContactSheet({ open, onClose, phone = DISCOVR_PHONE, phoneDisplay = DISCOVR_PHONE_DISPLAY }: ContactSheetProps) {
  const wa = `https://wa.me/${phone.replace(/[^\d]/g, "")}`;
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Talk to us"
      subtitle="Our founder answers your call or WhatsApp message. Feel free to reach out for anything."
    >
      <SheetOptions>
        <SheetOption href={`tel:${phone}`} icon={<PhoneIcon />} title="Call us" sub={phoneDisplay} />
        <SheetOption href={wa} external icon={<MessageIcon />} title="WhatsApp us" sub="Same number. We usually reply instantly." />
      </SheetOptions>
    </Sheet>
  );
}
