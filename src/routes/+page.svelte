<script lang="ts">
    import { getRoute } from "$lib";
    import { WebRTCSession } from "$lib/webrtc_session";

    let isDoing = false;
    let session: WebRTCSession;
    let shareLinkInput: HTMLInputElement;
    let shareLink = "";
    let output = "";
    let message = "";
    let answerText = "";
    let isConnected = false;
    function createChatRoom() {
        let name = prompt("Please input your name");
        if (!name) {
            return;
        }

        isDoing = true;
        session = new WebRTCSession((s) => {
            output = s + "\n" + output;
        });
        session.createRoom(name).then((s) => {
            shareLink =
                location.href +
                getRoute("join") +
                "?offer=" +
                encodeURIComponent(s);
        });
    }
    function hangup() {
        isDoing = false;
    }
    function sendMessage() {
        if (!session || !message) return;
        session.sendMessage(message);
        message='';
    }
    function connect(self: HTMLButtonElement) {
        if (!answerText) {
            alert("please input your answer text");
            return;
        }
        self.disabled = true;
        session
            .connect(answerText)
            .then((e) => {
                isConnected = true;
            })
            .catch((e) => alert(e));
    }
</script>

<div class="col">
    <div class="colst w maxwsm">
        <h1>Welcome to <cite>RemoteConnect</cite></h1>
        <div>
            <button disabled={isDoing} on:click={(e) => createChatRoom()}>
                Create a chatroom
            </button>
            {#if isDoing && !shareLink}
                <progress />
            {/if}
            {#if isDoing}
                <button on:click={hangup}>Hang Up</button>
            {/if}
        </div>

        {#if shareLink && !isConnected}
            <div class="p">
                <span>Share this link to your friend</span>
                <input
                    disabled
                    type="text"
                    bind:this={shareLinkInput}
                    bind:value={shareLink}
                />
                <button
                    on:click={(e) => {
                        let self = e.currentTarget;
                        self.disabled = true;

                        shareLinkInput.disabled = false;
                        shareLinkInput.focus();
                        shareLinkInput.select();
                        document.execCommand("copy");
                        self.innerText = "OK";
                        shareLinkInput.disabled = true;
                        setTimeout(() => {
                            self.disabled = false;
                            self.innerText = "COPY";
                        }, 1000);
                    }}>COPY</button
                >
            </div>
        {/if}
        <hr />
        {#if isDoing && !isConnected && shareLink}
            <textarea
                bind:value={answerText}
                rows="10"
                placeholder="paste his/her answer text here to connect"
            />
            <button on:click={(e) => connect(e.currentTarget)}>Connect</button>
        {/if}
        <hr />
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
