import { Component, OnInit } from '@angular/core';
import { RedditResult, RedditService } from './providers/reddit.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  public redditSearchText: string;
  public redditSearchTextChanged = new Subject<string>();
  public redditResults$: BehaviorSubject<RedditResult[]> = new BehaviorSubject(Object([]));
  public page: number;
  public disableNextPage: boolean;

  constructor(
    private redditService: RedditService,
    private spinner: NgxSpinnerService
  ) {
    this.redditSearchTextChanged.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe(model => {
      if (model) {
        this.spinner.show();
      }

      this.redditSearchText = model;
      this.searchReddit();
    });
  }

  ngOnInit() {
  }

  public onSearchChange(query: string) {
    this.redditSearchTextChanged.next(query);
  }

  public searchReddit() {
    if (!this.redditSearchText.length) {
      return;
    }

    this.redditService
      .search(this.redditSearchText)
      .pipe(
        tap(() => this.spinner.hide()),
        tap(() => this.page = 1)
      )
      .subscribe(res => this.redditResults$.next(res));
  }

  showPrevPage() {
    this.spinner.show();
    const beforeRedditName = this.redditResults$.value[0].name;
    this.redditService
      .search(this.redditSearchText, { before: beforeRedditName })
      .pipe(
        tap(() => this.spinner.hide())
      )
      .subscribe(res => {
        this.disableNextPage = false;
        if (!res) {
          this.page = 1;
          return;
        }

        this.page--;
        this.redditResults$.next(res);
      });
  }

  showNextPage() {
    this.spinner.show();
    const afterRedditName = this.redditResults$.value[this.redditResults$.value.length - 1].name;
    this.redditService
      .search(this.redditSearchText, { after: afterRedditName })
      .pipe(
        tap(() => this.spinner.hide())
      )
      .subscribe(res => {
        if (!res) {
          this.disableNextPage = true;
          return;
        }

        this.page++;
        this.redditResults$.next(res);
      });
  }
}
