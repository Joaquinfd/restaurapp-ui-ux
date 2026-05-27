"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon } from "@hugeicons/core-free-icons";
import { useRestaurantsStore } from "@/store/restaurants.store";
import { MENU_ITEM_TYPES } from "@/lib/constants";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { MenuItem, MenuItemType } from "@/types";

const TYPE_ORDER: MenuItemType[] = [
  "Entrada",
  "Plato principal",
  "Acompañamiento",
  "Postre",
  "Bebida",
];

const TYPE_ICON: Record<MenuItemType, string> = {
  Entrada: "🥗",
  "Plato principal": "🍽️",
  Acompañamiento: "🥔",
  Postre: "🍮",
  Bebida: "🥤",
};

type KeyedItem = MenuItem & { _key: number };

interface MenuTabProps {
  restaurantId: string;
}

export function MenuTab({ restaurantId }: MenuTabProps) {
  const { restaurants, updateRestaurant } = useRestaurantsStore();
  const restaurant = restaurants.find((r) => r.id === restaurantId)!;

  const [items, setItems] = useState<KeyedItem[]>(() =>
    restaurant.menuItems.map((item, i) => ({ ...item, _key: i })),
  );
  const keyRef = useRef(restaurant.menuItems.length);
  const [recentKeys, setRecentKeys] = useState<Set<number>>(new Set());

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newType, setNewType] = useState<MenuItemType>("Plato principal");

  const addItem = () => {
    if (!newName.trim()) return;
    const key = keyRef.current++;
    setItems((prev) => [
      ...prev,
      {
        _key: key,
        name: newName.trim(),
        description: newDesc.trim(),
        price: Number(newPrice) || 0,
        type: newType,
      },
    ]);
    setRecentKeys((prev) => new Set([...prev, key]));
    setNewName("");
    setNewDesc("");
    setNewPrice("");
    setNewType("Plato principal");
  };

  const removeItem = (key: number) => {
    setItems((prev) => prev.filter((x) => x._key !== key));
    setRecentKeys((prev) => {
      const s = new Set(prev);
      s.delete(key);
      return s;
    });
  };

  const updateItem = (key: number, field: keyof MenuItem, value: string | number) =>
    setItems((prev) => prev.map((x) => (x._key === key ? { ...x, [field]: value } : x)));

  const save = () => {
    updateRestaurant(restaurantId, {
      menuItems: items.map(({ name, description, price, type }) => ({
        name,
        description,
        price,
        type,
      })),
    });
    toast.success("Menú guardado");
  };

  const recentItems = items.filter((x) => recentKeys.has(x._key));

  return (
    <section className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Recently added — in-memory only, clears on unmount */}
      {recentItems.length > 0 && (
        <div>
          <SectionHeader label="Recientemente añadidos" icon="✨" count={recentItems.length} />
          <div className="space-y-2">
            {recentItems.map((item) => (
              <ItemRow
                key={item._key}
                item={item}
                onUpdate={updateItem}
                onRemove={removeItem}
                isNew
              />
            ))}
          </div>
        </div>
      )}

      {/* Items grouped by type */}
      {TYPE_ORDER.map((type) => {
        const typeItems = items.filter((x) => x.type === type);
        if (typeItems.length === 0) return null;
        return (
          <div key={type}>
            <SectionHeader label={type} icon={TYPE_ICON[type]} count={typeItems.length} />
            <div className="space-y-2">
              {typeItems.map((item) => (
                <ItemRow
                  key={item._key}
                  item={item}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  isNew={recentKeys.has(item._key)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {items.length === 0 && (
        <p className="text-muted-foreground py-6 text-center text-sm">
          Aún no hay platos en el menú.
        </p>
      )}

      {/* Add form */}
      <div className="rounded-xl border-2 border-dashed border-neutral-200 p-4 dark:border-neutral-700">
        <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
          Añadir plato
        </p>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nombre</Label>
              <Input
                placeholder="Ej. Risotto de setas"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descripción</Label>
              <Input
                placeholder="Ingredientes o breve descripción"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select value={newType} onValueChange={(v) => setNewType(v as MenuItemType)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MENU_ITEM_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Precio ($)</Label>
              <Input
                type="number"
                placeholder="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-32"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="invisible text-xs">Acción</Label>
              <Button type="button" onClick={addItem}>
                Añadir plato
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-neutral-100 pt-4 dark:border-neutral-800">
        <Button onClick={save}>Guardar menú</Button>
      </div>
    </section>
  );
}

function SectionHeader({ label, icon, count }: { label: string; icon: string; count: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-base">{icon}</span>
      <span className="text-foreground text-sm font-semibold">{label}</span>
      <Badge variant="secondary" className="text-xs">
        {count}
      </Badge>
    </div>
  );
}

function ItemRow({
  item,
  onUpdate,
  onRemove,
  isNew = false,
}: {
  item: KeyedItem;
  onUpdate: (key: number, field: keyof MenuItem, value: string | number) => void;
  onRemove: (key: number) => void;
  isNew?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-xl border p-4 transition-colors sm:grid-cols-[1fr_1fr_160px_100px_auto]",
        isNew
          ? "border-blue-200 bg-blue-50/40 dark:border-blue-800/60 dark:bg-blue-950/20"
          : "border-neutral-100 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800",
      )}
    >
      <div className="space-y-1">
        <Label className="text-muted-foreground text-xs">Nombre</Label>
        <Input value={item.name} onChange={(e) => onUpdate(item._key, "name", e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label className="text-muted-foreground text-xs">Descripción</Label>
        <Textarea
          value={item.description}
          onChange={(e) => onUpdate(item._key, "description", e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-muted-foreground text-xs">Tipo</Label>
        <Select
          value={item.type}
          onValueChange={(v) => onUpdate(item._key, "type", v as MenuItemType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MENU_ITEM_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-muted-foreground text-xs">Precio ($)</Label>
        <Input
          type="number"
          value={item.price}
          onChange={(e) => onUpdate(item._key, "price", Number(e.target.value))}
        />
      </div>
      <div className="space-y-1">
        <Label className="invisible text-xs">Acción</Label>
        <AlertDialog>
          <AlertDialogTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/20",
            )}
            aria-label="Eliminar"
          >
            <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-4" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este plato?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onRemove(item._key)}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
