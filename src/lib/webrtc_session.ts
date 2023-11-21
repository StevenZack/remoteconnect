export class WebRTCSession {
    private creator: string = '';
    private guest: string = '';
    private pc: RTCPeerConnection;
    private candidates: RTCIceCandidateInit[] = [];
    private sendDataChannel: RTCDataChannel;
    private onMessage: (s: string) => void;

    constructor(onMessage: (s: string) => void) {
        this.onMessage = onMessage;
        this.pc = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302",
                    ],
                },
            ],
            iceCandidatePoolSize: 10,
        });
        this.pc.onicecandidate = e => {
            if (!e.candidate) {
                return;
            }
            this.candidates.push(e.candidate.toJSON());
        };
        this.sendDataChannel = this.pc.createDataChannel('send');
        this.sendDataChannel.onopen = e => {
            console.log('send channel opened');
            if (this.creator) {
                this.sendMessage('(created this room)')
            } else {
                this.sendMessage('(joined this room)')
            }
        }
        this.sendDataChannel.onclose = e => {
            console.log('send channel closed');
        }

        this.pc.ondatachannel = e => {
            let receiveChannel = e.channel;
            receiveChannel.onmessage = e => {
                this.onMessage(e.data);
            }
            receiveChannel.onopen = e => {
                console.log('receive channel opened');
            }
            receiveChannel.onclose = e => {
                console.log('receive channel closed');
            }
        }
    }

    public async createRoom(name: string): Promise<string> {
        this.creator = name;
        let offerDescription = await this.pc.createOffer();
        await this.pc.setLocalDescription(offerDescription);

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        }
        await delay(2);
        let candidates = this.candidates;
        return JSON.stringify({
            offer,
            candidates,
        })
    }

    public async answer(name: string, roomOffer: string): Promise<string> {
        this.guest = name;
        let offer = JSON.parse(roomOffer);
        await this.pc.setRemoteDescription(new RTCSessionDescription(offer.offer));
        for (let c of offer.candidates) {
            await this.pc.addIceCandidate(new RTCIceCandidate(c));
        }

        let answerDescription = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answerDescription);

        const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
        }
        await delay(2);
        let candidates = this.candidates;
        return JSON.stringify({
            answer,
            candidates,
        })
    }
    public sendMessage(s: string) {
        if (this.creator) {
            s = this.creator + ': ' + s;
        } else {
            s = this.guest + ': ' + s;
        }
        this.sendDataChannel.send(s)
        this.onMessage(s);
    }
    public async connect(answerText: string): Promise<void> {
        let answer = JSON.parse(answerText);
        await this.pc.setRemoteDescription(answer.answer);
        for (let c of answer.candidates) {
            await this.pc.addIceCandidate(new RTCIceCandidate(c));
        }
    }
}

export function delay(second: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, second * 1000);
    })
}