<script lang="ts">
    import { page } from "$app/stores";
    import { WebRTCSession } from "$lib/webrtc_session";
    import { onMount } from "svelte";

    let isLoading = false;
    let answer = "";
    let answerInput: HTMLInputElement;
    let session: WebRTCSession;

    let isConnected = false;
    let output = "";
    let message = "";

    function sendMessage() {
        if (!session) return;
        session.sendMessage(message);
        message='';
    }

    onMount(async () => {
        let offerText = $page.url.searchParams.get("offer");
        if (!offerText) {
            alert("Room offer is empty in this link, or invalid roomt");
            return;
        }
        let name='';
        while (true) {
            let n = prompt("What is your name?");
            if (!n) {
                alert("name cannot be empty");
                return;
            }
            name = n;
            break;
        }

        isLoading = true;
        session = new WebRTCSession((s) => {
            isConnected = true;
            output = s + "\n" + output;
        });
        answer = await session.answer(name, offerText);
        isLoading = false;
    });
</script>

<div class="col">
    <div class="colst w maxwsm">
        <h1>Join a room</h1>
        {#if isLoading}
            <progress />
        {:else if !isConnected}
            <p>Send this answer text back to the room host to connect</p>
            <div>
                <input
                    type="text"
                    disabled
                    bind:this={answerInput}
                    bind:value={answer}
                />
                <button
                    on:click={(e) => {
                        let self = e.currentTarget;
                        self.disabled = true;
                        answerInput.disabled = false;
                        answerInput.focus();
                        answerInput.select();
                        document.execCommand("copy");
                        answerInput.disabled = true;
                        self.innerText = "OK";
                        setTimeout(() => {
                            self.disabled = false;
                            self.innerText = "Copy";
                        }, 1000);
                    }}>Copy</button
                >
            </div>
        {/if}

        {#if isConnected}
            <textarea disabled rows="10" bind:value={output} />
            <div>
                <input
                    type="text"
                    bind:value={message}
                    placeholder="input your message"
                    on:keypress={e=>{
                        if(e.key==='Enter'){
                            sendMessage();
                        }
                    }}
                />
                <button on:click={sendMessage}>send</button>
            </div>
        {/if}
    </div>
</div>
