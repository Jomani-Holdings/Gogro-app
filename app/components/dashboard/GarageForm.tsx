import Link from "next/link";
import { saveGarage } from "@/app/dashboard/admin/cms-actions";
import type { PartnerType } from "@/lib/data/types";

const inputClass =
  "w-full rounded-lg border border-grey/60 bg-white px-4 py-3 text-textdark placeholder:text-textdark/40 focus:outline-none focus:ring-2 focus:ring-orange/60";
const labelClass = "block text-sm font-semibold text-textdark mb-1.5";

type GarageData = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  partner_type_id: string | null;
  active: boolean;
  sort_order: number;
};

export function GarageForm({
  garage,
  types,
  isNew,
}: {
  garage: GarageData | null;
  types: PartnerType[];
  isNew: boolean;
}) {
  return (
    <form
      action={saveGarage}
      className="bg-white border border-grey/40 rounded-2xl p-6 max-w-xl space-y-5"
    >
      <input
        type="hidden"
        name="id"
        value={isNew ? "new" : (garage?.id ?? "new")}
      />

      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={garage?.name ?? ""}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label htmlFor="partner_type_id" className={labelClass}>
          Partner Type
        </label>
        <select
          id="partner_type_id"
          name="partner_type_id"
          defaultValue={garage?.partner_type_id ?? types[0]?.id ?? ""}
          className={inputClass}
          required
        >
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="address" className={labelClass}>
          Address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          defaultValue={garage?.address ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="text"
          defaultValue={garage?.phone ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="latitude" className={labelClass}>
            Latitude
          </label>
          <input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            defaultValue={garage?.latitude ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="longitude" className={labelClass}>
            Longitude
          </label>
          <input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            defaultValue={garage?.longitude ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 items-end">
        <div>
          <label htmlFor="sort_order" className={labelClass}>
            Sort Order
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={garage?.sort_order ?? 0}
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-textdark pb-3">
          <input
            type="checkbox"
            name="active"
            defaultChecked={garage?.active ?? true}
            className="h-4 w-4 accent-orange"
          />
          Active
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-orange text-white font-semibold py-3 px-6 transition-colors hover:bg-orange/90"
        >
          Save garage
        </button>
        <Link
          href="/dashboard/admin/garages"
          className="inline-flex items-center justify-center rounded-lg border border-navy text-navy font-semibold py-3 px-6 transition-colors hover:bg-navy/5"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
