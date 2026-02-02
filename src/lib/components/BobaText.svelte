<script lang="ts">
    import { onMount } from 'svelte';

    interface Props {
        text?: string;
        fontSize?: number;
        wave?: boolean;
    }

    let { text = ">PRESS ENTER", fontSize = 32, wave = false }: Props = $props();

    let textEl: SVGTextElement;
    let measureEl: SVGTextElement;
    let svgWidth = $state(0);
    let charWidths = $state<number[]>([]);
    let waveOffsets = $state<number[]>([]);
    let animationFrame: number;
    let measured = false;

    const chars = $derived(text.split(''));
    const charPositions = $derived(() => {
        let x = 5;
        return chars.map((_, i) => {
            const pos = x;
            x += charWidths[i] || fontSize * 0.6;
            return pos;
        });
    });

    onMount(() => {
        updateWidth();
        
        if (wave) {
            let startTime = performance.now();
            function animate() {
                const elapsed = performance.now() - startTime;
                waveOffsets = chars.map((_, i) => {
                    return Math.sin((elapsed / 200) + (i * 0.5)) * 4;
                });
                animationFrame = requestAnimationFrame(animate);
            }
            animate();
        }
        
        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    });

    function updateWidth() {
        const el = measureEl || textEl;
        if (el && !measured) {
            const bbox = el.getBBox();
            svgWidth = bbox.width + 20;
            
            if (wave) {
                const tempWidths: number[] = [];
                for (let i = 0; i < chars.length; i++) {
                    const extent = el.getExtentOfChar(i);
                    tempWidths.push(extent.width);
                }
                charWidths = tempWidths;
                measured = true;
            }
        }
    }

    $effect(() => {
        text;
        fontSize;
        measured = false;
        updateWidth();
    });
</script>

<div class="boba-container">
    <svg width={svgWidth || 'auto'} height={fontSize + 20} overflow="visible" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Hidden measurement text -->
        {#if wave}
            <text bind:this={measureEl} fill="black" stroke="#F9F3EB" style="white-space: pre; paint-order: stroke; opacity: 0; pointer-events: none;" stroke-width="6" stroke-linejoin="round" xml:space="preserve" font-family="Cook Widetype" font-size={fontSize} font-weight="600" letter-spacing="0em"><tspan x="5" y={fontSize}>{text}</tspan></text>
        {/if}
        
        {#if wave && charWidths.length > 0}
            <text class="boba-shadow" stroke="black" style="white-space: pre; paint-order: stroke" stroke-width="10" stroke-linejoin="round" xml:space="preserve" font-family="Cook Widetype" font-size={fontSize} font-weight="600" letter-spacing="0em">
                {#each chars as char, i}
                    <tspan x={charPositions()[i]} y={fontSize + (waveOffsets[i] || 0)}>{char}</tspan>
                {/each}
            </text>
            <text class="front" bind:this={textEl} fill="black" stroke="#F9F3EB" style="white-space: pre; paint-order: stroke" stroke-width="6" stroke-linejoin="round" xml:space="preserve" font-family="Cook Widetype" font-size={fontSize} font-weight="600" letter-spacing="0em">
                {#each chars as char, i}
                    <tspan x={charPositions()[i]} y={fontSize + (waveOffsets[i] || 0)}>{char}</tspan>
                {/each}
            </text>
        {:else}
            <text class="boba-shadow" stroke="black" style="white-space: pre; paint-order: stroke" stroke-width="10" stroke-linejoin="round" xml:space="preserve" font-family="Cook Widetype" font-size={fontSize} font-weight="600" letter-spacing="0em"><tspan x="5" y={fontSize}>{text}</tspan></text>
            <text class="front" bind:this={textEl} fill="black" stroke="#F9F3EB" style="white-space: pre; paint-order: stroke" stroke-width="6" stroke-linejoin="round" xml:space="preserve" font-family="Cook Widetype" font-size={fontSize} font-weight="600" letter-spacing="0em"><tspan x="5" y={fontSize}>{text}</tspan></text>
        {/if}
    </svg>
</div>

<style>
    .boba-container {
        display: inline-block;
    }
    
    .boba-container svg {
        display: block;
    }

    .boba-shadow {
        -webkit-filter: drop-shadow( 3px 3px 0px rgba(0, 0, 0, 1));
        
        filter: drop-shadow( 3px 3px 0px rgba(0, 0, 0, 1));
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.15s ease;
    }

    .front {
    	transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    </style>
