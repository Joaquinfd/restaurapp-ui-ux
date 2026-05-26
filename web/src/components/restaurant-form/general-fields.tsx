"use client";

import { CATEGORIES, PRICE_OPTIONS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddressField, type GeoPreview } from "./address-field";
import type { Restaurant } from "@/types";

type PriceRange = Restaurant["priceRange"];

export interface GeneralFieldsProps {
  name: string;
  onNameChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  cuisine: string;
  onCuisineChange: (v: string) => void;
  priceRange: PriceRange;
  onPriceRangeChange: (v: PriceRange) => void;
  address: string;
  onAddressChange: (v: string) => void;
  onGeoChange: (geo: GeoPreview | null) => void;
  initialGeo?: GeoPreview;
  locationDetail: string;
  onLocationDetailChange: (v: string) => void;
  openingHours: string;
  onOpeningHoursChange: (v: string) => void;
  required?: boolean;
}

export function GeneralFields({
  name, onNameChange,
  description, onDescriptionChange,
  cuisine, onCuisineChange,
  priceRange, onPriceRangeChange,
  address, onAddressChange, onGeoChange, initialGeo,
  locationDetail, onLocationDetailChange,
  openingHours, onOpeningHoursChange,
  required,
}: GeneralFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nombre del restaurante {required && "*"}</Label>
        <Input
          required={required}
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ej. La Trattoria di Napoli"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Descripción {required && "*"}</Label>
        <Textarea
          required={required}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe brevemente tu restaurante…"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Tipo de cocina {required && "*"}</Label>
          <Select value={cuisine} onValueChange={(v) => { if (v) onCuisineChange(v); }}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.name} value={c.name}>{c.icon} {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Rango de precios {required && "*"}</Label>
          <Select value={priceRange} onValueChange={(v) => onPriceRangeChange(v as PriceRange)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRICE_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Dirección {required && "*"}</Label>
        <AddressField
          value={address}
          onChange={onAddressChange}
          onGeoChange={onGeoChange}
          initialGeo={initialGeo}
          required={required}
        />
      </div>
      <div className="space-y-1.5">
        <Label>
          Detalle de ubicación <span className="text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <Input
          type="text"
          value={locationDetail}
          onChange={(e) => onLocationDetailChange(e.target.value)}
          placeholder="Ej. Piso 3, Local 42 · Mall Costanera Center"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Horario de atención</Label>
        <Input
          type="text"
          value={openingHours}
          onChange={(e) => onOpeningHoursChange(e.target.value)}
          placeholder="Ej. 12:00 - 23:00"
        />
      </div>
    </div>
  );
}
