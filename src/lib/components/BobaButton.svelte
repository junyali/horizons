<script lang="ts">
    import type { HTMLButtonAttributes } from 'svelte/elements';
    import BobaText from './BobaText.svelte';

    interface Props extends HTMLButtonAttributes {
        text?: string;
        fontSize?: number;
        className?: string;
        sunken?: boolean;
        pressed?: boolean;
        blink?: boolean;
        wave?: boolean;
        fallbackWidth?: number;
    }

    let { text = ">PRESS ENTER", fontSize = 32, sunken = false, fallbackWidth = 0, pressed = false, blink = true, wave = false, className = "", ...rest }: Props = $props();

    let buttonEl: HTMLButtonElement;

    export function click() {
        buttonEl?.click();
    }
</script>

<button bind:this={buttonEl} class="boba-container {className}" class:pressed class:blink class:sunken {...rest}>
    <BobaText {text} {fontSize} {wave} />
</button>

<style>
    .boba-container {
        display: inline-block;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
    }

    .boba-container.blink {
        animation: blink 1s ease-in-out infinite;
    }

    .boba-container.blink:active,
    .boba-container.blink.pressed {
        animation: none;
    }

    @keyframes blink {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.4;
        }
    }

    .boba-container :global(svg) {
        display: block;
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.15s ease;
    }

    .boba-container:hover :global(svg),
    .boba-container:focus :global(svg) {
        transform: translate(-3px, -3px);
        filter: drop-shadow(6px 6px 0px rgba(0, 0, 0, 1));
    }

    .boba-container:active :global(svg),
    .boba-container.pressed :global(svg) {
        transform: translate(3px, 3px);
        filter: drop-shadow(0px 0px 0px rgba(0, 0, 0, 1));
    }

    .boba-container:focus {
        outline: none;
    }
</style>
