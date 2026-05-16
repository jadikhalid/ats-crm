import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SESSION_ACCESS_TOKEN_KEY } from './session.constants';
import type { TokenBearer } from './token-bearer';

@Injectable()
export class LocalTokenBearer implements TokenBearer {
  getBearerToken$(): Observable<string | null> {
    return of(localStorage.getItem(SESSION_ACCESS_TOKEN_KEY));
  }
}
