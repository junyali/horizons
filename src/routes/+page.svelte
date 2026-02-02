<script lang="ts">
	import BG from '$lib/components/BG.svelte';
	import BobaText from '$lib/components/BobaText.svelte';
	import Stripes from '$lib/components/Stripes.svelte';
	import Logo from '$lib/assets/Logo.svg';
    import { onMount } from 'svelte';
    import BobaButton from '$lib/components/BobaButton.svelte';
    import TransAm from '$lib/components/TransAm.svelte';
    import Card from '$lib/components/Card.svelte';
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    

    let activated = $state(false);
    let pressed = $state(false);
    let transitioning = $state(false);
    let stripesOutro = $state(false);
    let selectedCard = $state(1);
    let selectedElement = $state(-1); // -1 = card itself, 0+ = index within focusable elements
    let cardRefs: HTMLElement[] = [];
    let isTyping = $state(false);
    let btnPressed = $state(false);

    let logoRect: DOMRect | null = $state(null);
    let stripesRect: DOMRect | null = $state(null);

    function captureLogoRect(node: HTMLElement) {
        logoRect = node.getBoundingClientRect();
        return { duration: 0 };
    }

    function captureStripesRect(node: HTMLElement) {
        stripesRect = node.getBoundingClientRect();
        return { duration: 0 };
    }

    function animateLogoIn(node: HTMLElement) {
        if (!logoRect) return { duration: 0 };
        const to = node.getBoundingClientRect();
        const dx = logoRect.left - to.left;
        const dy = logoRect.top - to.top;
        const sx = logoRect.width / to.width;
        const sy = logoRect.height / to.height;
        return {
            duration: 600,
            easing: quintOut,
            css: (t: number) => {
                const u = 1 - t;
                return `transform: translate(${u * dx}px, ${u * dy}px) scale(${1 + u * (sx - 1)}, ${1 + u * (sy - 1)}); transform-origin: top left;`;
            }
        };
    }

    function animateStripesIn(node: HTMLElement) {
        if (!stripesRect) return { duration: 0 };
        const to = node.getBoundingClientRect();
        const dx = stripesRect.left - to.left;
        const dy = stripesRect.top - to.top;
        const sx = stripesRect.width / to.width;
        const sy = stripesRect.height / to.height;
        return {
            duration: 600,
            easing: quintOut,
            css: (t: number) => {
                const u = 1 - t;
                return `transform: translate(${u * dx}px, ${u * dy}px) scale(${1 + u * (sx - 1)}, ${1 + u * (sy - 1)}); transform-origin: top left;`;
            }
        };
    }

    function showDetail() {
        transitioning = true;
        activated = true;
        pressed = false;

        setTimeout(() => {
            transitioning = false;
        }, 600);
    }

    function getFocusableElements(cardIndex: number): HTMLElement[] {
        const card = cardRefs[cardIndex];
        if (!card) return [];
        return Array.from(card.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])'));
    }

    function focusSelectedElement() {
        const elements = getFocusableElements(selectedCard);
        if (selectedElement >= 0 && selectedElement < elements.length) {
            elements[selectedElement]?.focus();
        } else {
            (document.activeElement as HTMLElement)?.blur();
        }
    }

    function handleElementFocus(ev: FocusEvent) {
        const target = ev.target as HTMLElement;
        const elements = getFocusableElements(selectedCard);
        const index = elements.indexOf(target);
        if (index >= 0) {
            selectedElement = index;
        }
        if (target.tagName === 'INPUT') {
            isTyping = true;
        }
    }

    function handleElementBlur(ev: FocusEvent) {
        isTyping = false;
        const container = cardRefs[selectedCard];
        const relatedTarget = ev.relatedTarget as HTMLElement;
        if (!container?.contains(relatedTarget)) {
            selectedElement = -1;
        }
    }

    function handleElementKeydown(ev: KeyboardEvent) {
        const elements = getFocusableElements(selectedCard);
        const isInput = (ev.target as HTMLElement).tagName === 'INPUT';
        
        if (isInput && ev.key !== 'Enter' && ev.key !== 'Tab' && ev.key !== 'Escape') {
            return; // Allow typing in inputs
        }

        if (ev.key === 'Enter') {
            if (isInput && selectedElement < elements.length - 1) {
                ev.preventDefault();
                selectedElement++;
                focusSelectedElement();
            } else if (!isInput) {
                btnPressed = true;
                setTimeout(() => { btnPressed = false; }, 150);
            }
        } else if (ev.key === 'Tab') {
            if (selectedElement < elements.length - 1) {
                ev.preventDefault();
                selectedElement++;
                focusSelectedElement();
            } else if (!ev.shiftKey) {
                ev.preventDefault();
                selectedElement = -1;
                selectedCard = Math.min(2, selectedCard + 1);
                (document.activeElement as HTMLElement)?.blur();
            }
        } else if ((ev.key === 'Tab' && ev.shiftKey) || ev.key === 'Escape') {
            ev.preventDefault();
            if (selectedElement > 0) {
                selectedElement--;
                focusSelectedElement();
            } else {
                selectedElement = -1;
                (document.activeElement as HTMLElement)?.blur();
            }
        } else if (ev.key === 'w' || ev.key === 'W' || ev.key === 'ArrowUp') {
            ev.preventDefault();
            if (selectedElement > 0) {
                selectedElement--;
                focusSelectedElement();
            } else {
                selectedElement = -1;
                (document.activeElement as HTMLElement)?.blur();
            }
        } else if (ev.key === 's' || ev.key === 'S' || ev.key === 'ArrowDown') {
            ev.preventDefault();
            if (selectedElement < elements.length - 1) {
                selectedElement++;
                focusSelectedElement();
            }
        } else if (ev.key === 'a' || ev.key === 'A' || ev.key === 'ArrowLeft') {
            ev.preventDefault();
            selectedElement = -1;
            selectedCard = Math.max(0, selectedCard - 1);
            (document.activeElement as HTMLElement)?.blur();
        } else if (ev.key === 'd' || ev.key === 'D' || ev.key === 'ArrowRight') {
            ev.preventDefault();
            selectedElement = -1;
            selectedCard = Math.min(2, selectedCard + 1);
            (document.activeElement as HTMLElement)?.blur();
        }
    }

    onMount(() => {
        window.onkeydown = (ev) => {
            if (!activated) {
                if (ev.key === 'Enter' && !stripesOutro) {
                    pressed = true;
                    setTimeout(() => {
                        stripesOutro = true;
                        setTimeout(showDetail, 400);
                    }, 150);
                }
            } else {
                if (isTyping) return;
                if (selectedElement >= 0) return; // Let element handlers deal with it

                const elements = getFocusableElements(selectedCard);
                
                if (ev.key === 'a' || ev.key === 'A' || ev.key === 'ArrowLeft') {
                    selectedCard = Math.max(0, selectedCard - 1);
                    selectedElement = -1;
                } else if (ev.key === 'd' || ev.key === 'D' || ev.key === 'ArrowRight') {
                    selectedCard = Math.min(2, selectedCard + 1);
                    selectedElement = -1;
                } else if (ev.key === 's' || ev.key === 'S' || ev.key === 'ArrowDown' || ev.key === 'Enter') {
                    if (elements.length > 0) {
                        ev.preventDefault();
                        selectedElement = 0;
                        focusSelectedElement();
                    }
                }
            }
        };
    });
</script>

<TransAm />

<BG class="flex flex-col overflow-hidden">
    {#if !activated}
        <div class="flex-1 flex flex-col justify-center absolute inset-0">
            <div class="flex flex-col items-center justify-center px-16 pb-4">
                <div out:captureLogoRect>
                    <img src={Logo} alt="Hack Club Horizon" class="w-full max-w-7xl" />
                </div>
            </div>

            <div out:captureStripesRect>
                <Stripes outro={stripesOutro} />
            </div>

            {#if !stripesOutro}
                <div class="flex flex-col items-center justify-center px-16 mt-8" out:fade={{ duration: 300, delay: 100 }}>
                    <BobaButton text="> PRESS  ENTER" fallbackWidth={260} {pressed} className="pointer-events-none select-none" wave />
                </div>
            {/if}
        </div>
    {/if}
    {#if activated}
        <div class="flex flex-col h-full gap-8 pb-8">
            <div class="flex flex-col">
                <div class="flex gap-4 items-end px-10 pt-10 pb-3">
                    <div in:animateLogoIn>
                        <img src={Logo} alt="Hack Club Horizon" class="h-24" />
                    </div>
                    <p in:fade={{ duration: 300, delay: 200 }} class="tagline">HACK CLUB'S <span class="underline">BIGGEST</span> EVENT</p>
                </div>
                <div in:animateStripesIn>
                    <Stripes class="stripe-small" />
                </div>
            </div>

            <div class="flex justify-center items-center gap-8 px-10 h-[435px]">
                    <div in:fly={{ y: 50, duration: 400, delay: 500 }} class="h-full" bind:this={cardRefs[0]}>
                        <Card title="WATCH THE VIDEO" selected={selectedCard === 0 && selectedElement === -1} class="w-80 h-full" />
                    </div>
                    <div in:fly={{ y: 50, duration: 400, delay: 600 }} class="h-full" bind:this={cardRefs[1]}>
                        <Card title="JOIN NOW" highlighted selected={selectedCard === 1 && selectedElement === -1} class="w-[437px] h-full gap-4">
                            <div class="w-full flex flex-col gap-5" role="group" onfocusin={handleElementFocus} onfocusout={handleElementBlur} onkeydown={handleElementKeydown}>
                                <div class="input-wrapper">
                                    <input 
                                        type="email" 
                                        placeholder="orpheus@hackclub.com" 
                                        class="input-field" 
                                        class:input-selected={selectedCard === 1 && selectedElement === 0}
                                    />
                                    {#if isTyping}
                                        <span class="exit-hint">Press Enter to continue</span>
                                    {/if}
                                </div>
                                <button class="submit-btn" class:btn-selected={selectedCard === 1 && selectedElement === 1} class:btn-pressed={btnPressed}>CONTINUE WITH HACK CLUB AUTH</button>
                            </div>
                        </Card>
                    </div>
                    <div in:fly={{ y: 50, duration: 400, delay: 700 }} class="h-full" bind:this={cardRefs[2]}>
                        <Card title="FAQ" selected={selectedCard === 2 && selectedElement === -1} class="w-80 h-full" />
                    </div>
                </div>

            <div in:fly={{ y: 20, duration: 300, delay: 800 }} class="flex justify-center">
                <BobaText text="USE  WASD  OR  YOUR  MOUSE" wave />
            </div>
        </div>
    {/if}
</BG>

<style>
    .tagline {
        font-family: 'Cook Widetype', sans-serif;
        font-size: 32px;
        font-weight: 600;
        color: black;
        margin: 0;
    }

    .stripe-small :global(.stripe) {
        height: 18px !important;
    }

    .input-field {
        width: 100%;
        padding: 8px 12px;
        background: #f3e8d8;
        border: 4px solid black;
        border-radius: 8px;
        box-shadow: 4px 4px 0px 0px black;
        font-family: 'Agdasima', sans-serif;
        font-size: 20px;
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease;
		outline: none;
    }

    .submit-btn {
        width: 100%;
        padding: 8px 12px;
        background: #ffa936;
        border: 4px solid black;
        border-radius: 8px;
        box-shadow: 4px 4px 0px 0px black;
        font-family: 'Agdasima', sans-serif;
        font-size: 20px;
        cursor: pointer;
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease;
		outline: none;
    }

    .submit-btn.btn-selected, .submit-btn:hover, .submit-btn:focus {
        border: 4px solid #ffa936;
        transform: translate(2px, 2px);
        box-shadow: 2px 2px 0px 0px black, inset 0px 0px 0px 4px black;
    }

    .submit-btn:active, .submit-btn.btn-selected:active {
        transform: translate(4px, 4px);
        box-shadow: 0px 0px 0px 0px black;
    }

    .input-field:focus, .input-selected {
        border-color: #ffa936 !important;
        transform: translate(4px, 4px);
        box-shadow: 0px 0px 0px 0px black !important;
    }

    .input-wrapper {
        position: relative;
        width: 100%;
    }

    .exit-hint {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-family: 'Agdasima', sans-serif;
        font-size: 14px;
        color: #666;
        pointer-events: none;
    }
</style>


