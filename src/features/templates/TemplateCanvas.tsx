import { useRef, useEffect } from "react";
import { Stage, Layer, Rect, Text, Line, Group, Transformer } from "react-konva";
import type Konva from "konva";
import { useTemplateStore } from "./useTemplateStore";
import type { TemplateSlot, SlotType } from "./useTemplateStore";

const SCALE = 4;

const SLOT_COLORS: Record<SlotType, string> = {
    title:     "#4A90D9",
    narrative: "#5BA85A",
    asset:     "#E8A838",
    separator: "#999999",
    menu:      "#9B59B6",
};

const SLOT_MIN_W = 8;
const SLOT_MIN_H = 8;

// Only asset and separator have pixel-meaningful resize
const RESIZABLE_TYPES: SlotType[] = ["asset", "separator"];

function slotRect(slot: TemplateSlot, canvasWidth: number): { x: number; y: number; width: number; height: number } {
    if (slot.type === "separator") {
        const x0 = slot.x0 ?? 1;
        const x1 = slot.x1 ?? canvasWidth - 2;
        return { x: x0, y: slot.y - 2, width: Math.max(x1 - x0, SLOT_MIN_W), height: 4 };
    }
    if (slot.type === "title") {
        return { x: slot.x, y: slot.y, width: 60, height: 10 };
    }
    if (slot.type === "menu") {
        return { x: slot.x, y: slot.y, width: 80, height: (slot.line_height ?? 12) * 3 };
    }
    return {
        x: slot.x,
        y: slot.y,
        width: slot.width ?? SLOT_MIN_W,
        height: slot.height ?? SLOT_MIN_H,
    };
}

interface SlotShapeProps {
    slot: TemplateSlot;
    canvasWidth: number;
    isSelected: boolean;
    onSelect: () => void;
    onDragEnd: (x: number, y: number) => void;
    onTransformEnd: (width: number, height: number) => void;
}

function SlotShape({ slot, canvasWidth, isSelected, onSelect, onDragEnd, onTransformEnd }: SlotShapeProps) {
    const shapeRef = useRef<Konva.Rect>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const color = SLOT_COLORS[slot.type];
    const r = slotRect(slot, canvasWidth);
    const canResize = RESIZABLE_TYPES.includes(slot.type);

    // Imperatively attach transformer to the rect after mount/selection change
    useEffect(() => {
        if (isSelected && canResize && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected, canResize]);

    return (
        <Group>
            <Rect
                ref={shapeRef}
                x={r.x * SCALE}
                y={r.y * SCALE}
                width={r.width * SCALE}
                height={r.height * SCALE}
                fill={color}
                opacity={0.45}
                stroke={isSelected ? "#fff" : color}
                strokeWidth={isSelected ? 2 : 1}
                draggable
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={(e) => {
                    const x = Math.round(e.target.x() / SCALE);
                    const y = Math.round(e.target.y() / SCALE);
                    e.target.position({ x: x * SCALE, y: y * SCALE });
                    onDragEnd(x, y);
                }}
                onTransformEnd={() => {
                    const node = shapeRef.current;
                    if (!node) return;
                    const newW = Math.max(SLOT_MIN_W, Math.round((node.width() * node.scaleX()) / SCALE));
                    const newH = Math.max(SLOT_MIN_H, Math.round((node.height() * node.scaleY()) / SCALE));
                    node.scaleX(1);
                    node.scaleY(1);
                    onTransformEnd(newW, newH);
                }}
            />
            <Text
                x={r.x * SCALE + 2}
                y={r.y * SCALE + 2}
                text={slot.type}
                fontSize={9}
                fill="#fff"
                listening={false}
            />
            {isSelected && canResize && (
                <Transformer
                    ref={trRef}
                    rotateEnabled={false}
                    keepRatio={false}
                    boundBoxFunc={(_old, newBox) => ({
                        ...newBox,
                        width: Math.max(SLOT_MIN_W * SCALE, newBox.width),
                        height: Math.max(SLOT_MIN_H * SCALE, newBox.height),
                    })}
                />
            )}
        </Group>
    );
}

export function TemplateCanvas() {
    const { width, height, slots, selectedSlotId, selectSlot, updateSlot } = useTemplateStore();

    return (
        <div className="templateCanvasWrap">
            <Stage width={width * SCALE} height={height * SCALE}>
                <Layer>
                    {/* screen background */}
                    <Rect
                        x={0} y={0}
                        width={width * SCALE}
                        height={height * SCALE}
                        fill="#fff"
                        stroke="#000"
                        strokeWidth={1}
                        onClick={() => selectSlot(null)}
                    />
                    {/* separator guide lines */}
                    {slots.filter((s) => s.type === "separator").map((slot) => (
                        <Line
                            key={`sep-line-${slot.id}`}
                            points={[
                                (slot.x0 ?? 1) * SCALE, slot.y * SCALE,
                                (slot.x1 ?? width - 2) * SCALE, slot.y * SCALE,
                            ]}
                            stroke={SLOT_COLORS.separator}
                            strokeWidth={1}
                            listening={false}
                        />
                    ))}
                    {slots.map((slot) => (
                        <SlotShape
                            key={slot.id}
                            slot={slot}
                            canvasWidth={width}
                            isSelected={selectedSlotId === slot.id}
                            onSelect={() => selectSlot(slot.id)}
                            onDragEnd={(x, y) => {
                                if (slot.type === "separator") {
                                    updateSlot(slot.id, { y });
                                } else {
                                    updateSlot(slot.id, { x, y });
                                }
                            }}
                            onTransformEnd={(w, h) => {
                                if (slot.type === "asset") {
                                    updateSlot(slot.id, { width: w, height: h });
                                } else if (slot.type === "separator") {
                                    const r = slotRect(slot, width);
                                    updateSlot(slot.id, { x1: r.x + w });
                                }
                            }}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
}
