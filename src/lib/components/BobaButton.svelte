<script lang="ts">
    import type { HTMLButtonAttributes } from 'svelte/elements';
    import BobaText from './BobaText.svelte';

    interface Props extends HTMLButtonAttributes {
        text?: string;
        fontSize?: number;
        className?: string;
        pressed?: boolean;
        blink?: boolean;
        wave?: boolean;
        fallbackWidth?: number;
    }

    let { text = ">PRESS ENTER", fontSize = 32, fallbackWidth = 0, pressed = false, blink = true, wave = false, className = "", ...rest }: Props = $props();

    let buttonEl: HTMLButtonElement;

    export function click() {
        buttonEl?.click();
    }
</script>

<button bind:this={buttonEl} class="boba-container {className}" class:blink {...rest}>
    <BobaText {text} {fontSize} {wave} {pressed} />
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
</style>
