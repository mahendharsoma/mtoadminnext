/**
 * inventory / item_inventory columns are NOT NULL.
 * CI4 stores common parts as make_type_id = 0, variant_id = 0 (never SQL NULL).
 */
export function resolveInventoryMakeVariantIds(
  isCommon: number | boolean | string | null | undefined,
  makeTypeId?: number | string | null,
  variantId?: number | string | null
): { makeTypeId: number; variantId: number } {
  const common = Number(isCommon) === 1;
  if (common) {
    return { makeTypeId: 0, variantId: 0 };
  }

  const make = Number(makeTypeId);
  const variant = Number(variantId);
  return {
    makeTypeId: Number.isFinite(make) ? make : 0,
    variantId: Number.isFinite(variant) ? variant : 0,
  };
}
