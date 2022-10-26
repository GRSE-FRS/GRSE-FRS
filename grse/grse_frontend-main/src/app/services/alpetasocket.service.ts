// src\app\services\websocket.service.ts
import { Injectable } from "@angular/core";
import { Observable, Observer } from 'rxjs';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Global from 'src/app/globals';

const CONNECTION_URL = "ws://" + Global.ALPETA_IP + "/v1/webEntry";

export interface Message {
  source: string;
  content: string;
}

@Injectable()
export class AlpetasocketService {
  private subject: AnonymousSubject<MessageEvent>;
  public result: Subject<Message>;

  constructor() {
    this.subject = this.create(CONNECTION_URL);
    this.result = <Subject<Message>>this.connect(CONNECTION_URL).pipe(
      map(
        (response: MessageEvent): Message => {
          // console.log(response.data);
          let data = JSON.parse(response.data)
          return data;
        }
      )
    );
  }

  public connect(url: any): AnonymousSubject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log("Successfully connected: " + url);
    }

    return this.subject;
  }

  private create(url: any): AnonymousSubject<MessageEvent> {
    let ws = new WebSocket(url);
    let observable = new Observable((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    let observer: any = {
      error: null,
      complete: null,
      next: (data: Object) => {
        console.log('Message sent to websocket: ', data);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };

    return new AnonymousSubject<MessageEvent>(observer, observable);
  }
}
