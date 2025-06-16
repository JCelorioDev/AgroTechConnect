import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { EmojiResponse } from '../../../core/models/Emoji/emojiResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class EmojiService {

  private readonly httpClient = inject(HttpClient);

  constructor() { }

  // Obtener lista de emojis

  getsAllEmojis(): Observable<EmojiResponse[]> {
    return this.httpClient
      .get<Record<string, Omit<EmojiResponse, 'emoji'>>>('documents/emoticons_json/emoticons.json')
      .pipe(
        map(data =>
          Object.entries(data).map(([emoji, props]) => ({
            ...props,
            emoji
          }))
        )
      );
  }
  
}
