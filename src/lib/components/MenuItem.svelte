<script lang="ts">
    import type { Snippet } from 'svelte';
    import ChevronSvg from '$lib/assets/shapes/chevron.svg';

    interface Props {
        title: string;
        subtitle?: string;
        selected?: boolean;
        chevron?: boolean;
        class?: string;
        icon?: Snippet;
        preserveIcon?: boolean;
    }

    let { title, subtitle, selected = false, chevron = false, class: className = '', icon, preserveIcon = false }: Props = $props();
</script>

<div class="menu-item {className} cursor-pointer" class:selected>
    <div class="content">
        <p class="title">{title}</p>
        <p class="subtitle" class:visible={subtitle && selected}>{subtitle ?? ''}</p>
    </div>
    <div class="icon" class:hidden={!icon || (selected && !preserveIcon)}>
        {#if icon}
            {@render icon()}
        {/if}
    </div>
    <div class="chevrons" class:visible={selected && chevron}>
        <img src={ChevronSvg} alt="" class="chevron" />
    </div>
</div>

<style>
    .menu-item {
        background-color: #f3e8d8;
        border: 4px solid black;
        border-radius: 20px;
        padding: 20px 40px;
        box-shadow: 4px 4px 0px 0px black;
        display: flex;
        align-items: center;
        justify-content: space-between;
        overflow: hidden;
        position: relative;
        height: 100px;
        width: 944px;
        transition: 
            height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
            width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
            background-color 0.25s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
    }

    .menu-item.selected {
        background-color: #ffa936;
        height: 180px;
        width: 1049px;
    }

    .content {
        display: flex;
        flex-direction: column;
        z-index: 1;
    }

    .title {
        font-family: 'Cook Widetype', sans-serif;
        font-size: 48px;
        font-weight: 600;
        color: black;
        margin: 0;
        line-height: 1;
    }

    .subtitle {
        font-family: 'Bricolage Grotesque', sans-serif;
        font-size: 24px;
        font-weight: 600;
        color: black;
        margin: 0;
        margin-top: 12px;
        letter-spacing: 0.01em;
        opacity: 0;
        max-height: 0;
        overflow: hidden;
        transition: 
            opacity 0.15s ease,
            max-height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .subtitle.visible {
        opacity: 1;
        max-height: 40px;
    }

    .icon {
        width: 64px;
        height: 64px;
        z-index: 1;
        transition: 
            opacity 0.2s ease,
            transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .icon.hidden {
        opacity: 0;
        transform: scale(0.8);
        pointer-events: none;
    }

    .icon :global(svg), .icon :global(img) {
        width: 100%;
        height: 100%;
    }

    .chevrons {
        position: absolute;
        right: 10%;
        top: 50%;
        transform: translateY(-50%) scale(200%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease 0.1s;
    }

    .chevrons.visible {
        opacity: 1;
    }

    .chevron {
        height: 180px;
        width: auto;
    }
</style>
