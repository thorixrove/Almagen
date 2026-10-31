import { type Editor, type TLArrowBinding } from "tldraw";
import { HEADER_HEIGHT, ROW_HEIGHT, getTableHeight, rowAnchorY, type EntityTableShape } from "@/components/EntityTable/EntityTableShape";


export function snapArrowBindingToRow(editor: Editor, binding: TLArrowBinding) {
    const table = editor.getShape(binding.toId)
    if (table?.type !== "entity-table") return
    const rowCount = (table as EntityTableShape).props.rows.length
    if (rowCount === 0) return

    const y = binding.props.normalizedAnchor.y * getTableHeight(rowCount) - HEADER_HEIGHT
    const rowIndex = Math.min(rowCount - 1, Math.max(0, Math.floor(y / ROW_HEIGHT)))

    editor.updateBinding({
        id: binding.id,
        type: "arrow",
        props: {
            ...binding.props,
            normalizedAnchor: { x: binding.props.normalizedAnchor.x, y: rowAnchorY(rowIndex, rowCount) },
            isPrecise: true
        }
    })
}