export const isBlockVisible = (block: { visible?: boolean | null }): boolean =>
  block.visible !== false;
