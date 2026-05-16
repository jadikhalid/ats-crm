import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { OpportunityApiService } from '../services/opportunity-api.service';
import { CandidateApiService } from '../../candidates/services/candidate-api.service';
import { MatchingApiService } from '../../matching/services/matching-api.service';
import { Opportunity } from '../models/opportunity.model';
import { Candidate } from '../../candidates/models/candidate.model';
import { MatchingResult } from '../../matching/models/matching-result.model';

function scoreToPercent(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function accentForScore(score: number): string {
  if (score >= 75) {
    return '#15803d';
  }
  if (score >= 50) {
    return '#2563eb';
  }
  if (score >= 35) {
    return '#ca8a04';
  }
  return '#c2410c';
}

@Component({
  selector: 'app-opportunity-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  template: `
    <section class="panel">
      <a routerLink="/opportunities" class="back">← Opportunités</a>

      @if (loading()) {
        <p>Chargement…</p>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else {
        @if (opportunity(); as o) {
        <header class="head">
          <h1>{{ o.title }}</h1>
          <p class="meta">
            Client : {{ o.clientCompanyName ?? '#' + o.clientId }} · {{ o.status }} · Budget :
            {{ o.budget != null ? (o.budget | number : '1.2-2') + ' €' : '—' }}
          </p>
        </header>

        <div class="blobs">
          <div><span class="label">Profil recherché</span><p>{{ o.profileSought }}</p></div>
          <div><span class="label">Description</span><p>{{ o.description }}</p></div>
        </div>

        <section class="match-section">
          <h2>Matching IA</h2>
          <p class="hint">Sélectionnez un candidat pour estimer son adéquation avec ce besoin.</p>

          <div class="match-row">
            <select [(ngModel)]="selectedCandId" class="select">
              <option [ngValue]="null">— Candidat —</option>
              @for (cand of candidates(); track cand.id) {
                <option [ngValue]="cand.id">
                  {{ cand.firstName }} {{ cand.lastName }} — {{ cand.skills.slice(0, 3).join(', ') || 'voir fiche' }}
                </option>
              }
            </select>
            <button
              type="button"
              class="btn-match"
              [disabled]="selectedCandId == null || matchLoading()"
              (click)="runMatch(o.id)"
            >
              {{ matchLoading() ? 'Calcul…' : 'Calculer le Matching IA' }}
            </button>
          </div>

          @if (matchError()) {
            <p class="error">{{ matchError() }}</p>
          }

          @if (matchResult(); as r) {
            <div class="match-result" [style.--accent]="accentForScore(r.score)">
              <div class="gauge-wrap">
                <div class="gauge" role="img" [attr.aria-label]="'Score ' + scoreToPercent(r.score) + ' pour cent'">
                  <div class="gauge-ring" [style.--p]="scoreToPercent(r.score)"></div>
                  <span class="gauge-value">{{ scoreToPercent(r.score) }}%</span>
                </div>
                <span class="badge-score">Score IA</span>
              </div>

              <div class="explain">
                <div class="col pros">
                  <h3>Points forts</h3>
                  @if (r.strengths.length) {
                    <ul>
                      @for (line of r.strengths; track line) {
                        <li>{{ line }}</li>
                      }
                    </ul>
                  } @else {
                    <p class="muted">Aucun point fort renvoyé par l&apos;IA.</p>
                  }
                </div>
                <div class="col cons">
                  <h3>Points d&apos;attention</h3>
                  @if (r.weaknesses.length) {
                    <ul>
                      @for (line of r.weaknesses; track line) {
                        <li>{{ line }}</li>
                      }
                    </ul>
                  } @else {
                    <p class="muted">Aucun point d&apos;attention renvoyé par l&apos;IA.</p>
                  }
                </div>
              </div>
            </div>
          }
        </section>
        }
      }
    </section>
  `,
  styles: `
    .panel {
      background: #fff;
      border-radius: 14px;
      padding: 1.75rem;
      max-width: 920px;
      box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08);
    }
    .back {
      display: inline-block;
      margin-bottom: 1rem;
      color: #2563eb;
      text-decoration: none;
      font-size: 0.9rem;
    }
    .head h1 {
      margin: 0;
      font-size: 1.45rem;
      color: #0f172a;
    }
    .meta {
      color: #64748b;
      margin: 0.4rem 0 0;
      font-size: 0.95rem;
      line-height: 1.4;
    }
    .blobs {
      margin: 1.5rem 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .blobs > div {
      padding: 1rem;
      background: #f8fafc;
      border-radius: 10px;
    }
    .label {
      display: block;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 0.4rem;
    }
    .blobs p {
      margin: 0;
      color: #334155;
      line-height: 1.5;
      font-size: 0.93rem;
    }
    .match-section {
      margin-top: 1.75rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }
    .match-section h2 {
      margin: 0 0 0.35rem;
      font-size: 1.15rem;
    }
    .hint {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0 0 1rem;
    }
    .match-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
      margin-bottom: 1rem;
    }
    .select {
      min-width: 280px;
      flex: 1;
      padding: 0.55rem 0.65rem;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 0.95rem;
    }
    .btn-match {
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      border: none;
      background: linear-gradient(135deg, #059669, #2563eb);
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.95rem;
    }
    .btn-match:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .error {
      color: #dc2626;
      font-size: 0.9rem;
    }
    .match-result {
      --accent: #2563eb;
      margin-top: 1.25rem;
      padding: 1.5rem;
      border-radius: 12px;
      background: linear-gradient(165deg, #f8fafc 0%, #fff 42%);
      border: 1px solid #e2e8f0;
    }
    .gauge-wrap {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .gauge {
      position: relative;
      width: 120px;
      height: 120px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .gauge-ring {
      --p: 0;
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: conic-gradient(var(--accent) calc(var(--p) * 1%), #e2e8f0 0);
      mask: radial-gradient(farthest-side, transparent 56%, black 56%);
      -webkit-mask: radial-gradient(farthest-side, transparent 56%, black 56%);
    }
    .gauge-value {
      position: relative;
      z-index: 1;
      font-size: 1.2rem;
      font-weight: 800;
      color: #0f172a;
      background: #fff;
      width: 68px;
      height: 68px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(15, 23, 42, 0.1);
    }
    .badge-score {
      font-size: 0.85rem;
      font-weight: 600;
      color: #475569;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .explain {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 640px) {
      .explain {
        grid-template-columns: 1fr;
      }
    }
    .col h3 {
      margin: 0 0 0.5rem;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .col.pros h3 {
      color: #15803d;
    }
    .col.cons h3 {
      color: #b45309;
    }
    .col ul {
      margin: 0;
      padding-left: 1.15rem;
      color: #334155;
      font-size: 0.9rem;
      line-height: 1.45;
    }
    .muted {
      margin: 0;
      font-size: 0.9rem;
      color: #94a3b8;
      font-style: italic;
    }
  `,
})
export class OpportunityDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly opportunityApi = inject(OpportunityApiService);
  private readonly candidateApi = inject(CandidateApiService);
  private readonly matchingApi = inject(MatchingApiService);

  readonly opportunity = signal<Opportunity | null>(null);
  readonly candidates = signal<Candidate[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  selectedCandId: number | null = null;

  readonly matchResult = signal<MatchingResult | null>(null);
  readonly matchLoading = signal(false);
  readonly matchError = signal<string | null>(null);

  readonly scoreToPercent = scoreToPercent;
  readonly accentForScore = accentForScore;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Identifiant manquant.');
      this.loading.set(false);
      return;
    }
    this.opportunityApi.findById(+id).subscribe({
      next: (o) => {
        this.opportunity.set(o);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Opportunité introuvable.');
        this.loading.set(false);
      },
    });
    this.candidateApi.findAll().subscribe({
      next: (list) => this.candidates.set(list),
      error: () => this.candidates.set([]),
    });
  }

  runMatch(opportunityId: number): void {
    const candId = this.selectedCandId;
    if (candId == null) {
      return;
    }
    this.matchLoading.set(true);
    this.matchError.set(null);
    this.matchResult.set(null);
    this.matchingApi.score({ candidateId: candId, opportunityId }).subscribe({
      next: (res) => {
        this.matchResult.set(res);
        this.matchLoading.set(false);
      },
      error: (err) => {
        this.matchLoading.set(false);
        const msg =
          err?.error?.detail ?? err?.error?.title ?? err?.message ?? 'Échec du matching IA.';
        this.matchError.set(typeof msg === 'string' ? msg : JSON.stringify(msg));
      },
    });
  }
}
