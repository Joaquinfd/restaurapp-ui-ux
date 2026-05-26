"use client";

import { useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon } from "@hugeicons/core-free-icons";
import { useRestaurantsStore } from "@/store/restaurants.store";
import { MENU_ITEM_TYPES } from "@/lib/constants";
import { Button, buttonVariants } from "@/components/ui/button";
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

interface MenuTabProps {
  restaurantId: string;
}

export function MenuTab({ restaurantId }: MenuTabProps) {
  const { restaurants, updateRestaurant } = useRestaurantsStore();
  const restaurant = restaurants.find((r) => r.id === restaurantId)!;

  const [menuItems, setMenuItems] = useState<MenuItem[]>(restaurant.menuItems);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemType, setNewItemType] = useState<MenuItemType>("Plato principal");

  const addMenuItem = () => {
    if (!newItemName.trim()) return;
    setMenuItems((prev) => [
      ...prev,
      { name: newItemName.trim(), description: newItemDesc.trim(), price: Number(newItemPrice) || 0, type: newItemType },
    ]);
    setNewItemName("");
    setNewItemDesc("");
    setNewItemPrice("");
    setNewItemType("Plato principal");
  };

  const removeMenuItem = (i: number) => setMenuItems((prev) => prev.filter((_, j) => j !== i));

  const updateMenuItem = (i: number, field: keyof MenuItem, value: string | number) =>
    setMenuItems((prev) => prev.map((item, j) => (j === i ? { ...item, [field]: value } : item)));

  const save = () => {
    updateRestaurant(restaurantId, { menuItems });
    toast.success("Menú guardado");
  };

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="space-y-3">
        {menuItems.length === 0 && (
          <p className="text-muted-foreground py-4 text-center text-sm">Aún no hay platos en el menú.</p>
        )}
        {menuItems.map((item, i) => (
          <div
            key={i}
            className="grid gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4 sm:grid-cols-[1fr_1fr_160px_100px_auto] dark:border-neutral-700 dark:bg-neutral-800"
          >
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Nombre</Label>
              <Input type="text" value={item.name} onChange={(e) => updateMenuItem(i, "name", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Descripción</Label>
              <Textarea
                value={item.description}
                onChange={(e) => updateMenuItem(i, "description", e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Tipo</Label>
              <Select value={item.type} onValueChange={(v) => updateMenuItem(i, "type", v as MenuItemType)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MENU_ITEM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Precio ($)</Label>
              <Input type="number" value={item.price} onChange={(e) => updateMenuItem(i, "price", Number(e.target.value))} />
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
                    <AlertDialogAction onClick={() => removeMenuItem(i)}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border-2 border-dashed border-neutral-200 p-4 dark:border-neutral-700">
        <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">Añadir plato</p>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nombre</Label>
              <Input type="text" placeholder="Ej. Risotto de setas" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descripción</Label>
              <Input type="text" placeholder="Ingredientes o breve descripción" value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select value={newItemType} onValueChange={(v) => setNewItemType(v as MenuItemType)}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MENU_ITEM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Precio ($)</Label>
              <Input type="number" placeholder="0" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} className="w-32" />
            </div>
            <div className="space-y-1.5">
              <Label className="invisible text-xs">Acción</Label>
              <Button type="button" onClick={addMenuItem}>Añadir plato</Button>
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
