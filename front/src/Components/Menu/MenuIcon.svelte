<script lang="ts">
    import logoTalk from "../images/logo-message-pixel.png";
    import logoSettings from "../images/logo-settings.png";
    import logoInvite from "../images/logo-invite-pixel.png";
    import logoRegister from "../images/logo-register-pixel.png";
    import logoMoodle from "../images/logo-moodle.png";
    import silentModeOff from "../images/silentmode-off.png";
    import silentModeOn from "../images/silentmode-on.png";
    import { localUserStore } from "../../Connexion/LocalUserStore";
    import { alwaysSilentStore, denyProximityMeetingStore } from "../../Stores/MediaStore";
    import { currentPlayerGroupIdStore } from "../../Stores/CurrentPlayerGroupStore";
    import { menuVisiblilityStore } from "../../Stores/MenuStore";
    import { chatVisibilityStore } from "../../Stores/ChatStore";
    import { limitMapStore } from "../../Stores/GameStore";
    import { get } from "svelte/store";
    import { onDestroy } from "svelte";
    import { ADMIN_URL, MOODLE_URL } from "../../Enum/EnvironmentVariable";
    import { showShareLinkMapModalStore } from "../../Stores/ModalStore";
    import { coWebsiteManager } from "../../WebRtc/CoWebsiteManager";
    import { SimpleCoWebsite } from "../../WebRtc/CoWebsite/SimpleCoWebsite";
    import LL from "../../i18n/i18n-svelte";
    import { analyticsClient } from "../../Administration/AnalyticsClient";

    let alwaysSilent: boolean;
    const unsubscribeAlwaysSilent = alwaysSilentStore.subscribe((value) => {
        alwaysSilent = value;
    });
    onDestroy(unsubscribeAlwaysSilent);

    let currentPlayerIsInGroup: boolean;
    const unsubscribeGroupId = currentPlayerGroupIdStore.subscribe((value) => {
        currentPlayerIsInGroup = value !== undefined;
    });
    onDestroy(unsubscribeGroupId);

    function showMenu() {
        menuVisiblilityStore.set(!get(menuVisiblilityStore));
    }

    function showChat() {
        chatVisibilityStore.set(true);
    }

    function register() {
        window.open(`${ADMIN_URL}/second-step-register`, "_self");
    }

    function showInvite() {
        showShareLinkMapModalStore.set(true);
    }

    function noDrag() {
        return false;
    }

    function changeAlwaysSilent() {
        alwaysSilentStore.set(!alwaysSilent);
        localUserStore.setAlwaysSilent(alwaysSilent);
        denyProximityMeetingStore.set(alwaysSilent);
    }

    async function openMoodle() {
        if (!MOODLE_URL) {
            return;
        }

        window.open(MOODLE_URL);
        return;

        // If already open, close Moodle iframe
        const matchingCoWebsites = coWebsiteManager.getCoWebsites().filter((cw) => {
            return cw.getUrl().href.startsWith(MOODLE_URL ?? 'invalid');
        });
        if (matchingCoWebsites.length > 0) {
            coWebsiteManager.closeCoWebsite(matchingCoWebsites[0]);
            return;
        }

        const coWebsite: SimpleCoWebsite = new SimpleCoWebsite(
            new URL(MOODLE_URL),
            false, // allow API
            undefined, // allow policy
            undefined, // width percent
            true // closable
        );
        coWebsiteManager.addCoWebsiteToStore(coWebsite, undefined);
        await coWebsiteManager.loadCoWebsite(coWebsite);
        coWebsiteManager.swapMainAndEmbed();
    }
</script>

<svelte:window />

<main class="menuIcon noselect">
    {#if $limitMapStore}
        <img
            src={logoInvite}
            alt={$LL.menu.icon.open.invite()}
            class="nes-pointer"
            draggable="false"
            on:dragstart|preventDefault={noDrag}
            on:click={() => analyticsClient.openInvite()}
            on:click={showInvite}
        />
        <img
            src={logoRegister}
            alt={$LL.menu.icon.open.register()}
            class="nes-pointer"
            draggable="false"
            on:dragstart|preventDefault={noDrag}
            on:click={() => analyticsClient.openRegister()}
            on:click={register}
        />
    {:else}
        <img
            src={logoSettings}
            alt={$LL.menu.icon.open.menu()}
            class="nes-pointer"
            draggable="false"
            on:dragstart|preventDefault={noDrag}
            on:click={() => analyticsClient.openedMenu()}
            on:click={showMenu}
        />
    {/if}
    <img
        src={$alwaysSilentStore ? silentModeOn : silentModeOff}
        alt={$LL.menu.settings.silentMode()}
        class="nes-pointer"
        draggable="false"
        on:dragstart|preventDefault={noDrag}
        on:click|preventDefault={changeAlwaysSilent}
    />
    {#if MOODLE_URL}
        <img
            src={logoMoodle}
            alt={$LL.menu.icon.open.moodle()}
            class="nes-pointer"
            draggable="false"
            on:dragstart|preventDefault={noDrag}
            on:click|preventDefault={openMoodle}
        />
    {/if}
    {#if currentPlayerIsInGroup}
        <img
            src={logoTalk}
            alt={$LL.menu.icon.open.chat()}
            class="nes-pointer"
            draggable="false"
            on:dragstart|preventDefault={noDrag}
            on:click={() => analyticsClient.openedChat()}
            on:click={showChat}
        />
    {/if}
</main>

<style lang="scss">
    @import "../../../style/breakpoints.scss";

    .menuIcon {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 20%;
        z-index: 800;
        position: relative;

        img {
            pointer-events: auto;
            width: 60px;
            padding-top: 0;
            margin: 5%;
            image-rendering: pixelated;
        }
    }

    .menuIcon img:hover {
        transform: scale(1.2);
    }

    @include media-breakpoint-up(sm) {
        .menuIcon {
            margin-top: 10%;
            img {
                pointer-events: auto;
                width: 60px;
                padding-top: 0;
                image-rendering: pixelated;
            }
        }
        .menuIcon img:hover {
            transform: scale(1.2);
        }
    }

    @include media-breakpoint-up(md) {
        .menuIcon {
            img {
                width: 50px;
                image-rendering: pixelated;
            }
        }
    }
</style>
