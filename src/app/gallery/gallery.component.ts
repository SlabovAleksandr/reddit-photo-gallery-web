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
  public redditResults$: BehaviorSubject<RedditResult[]> = new BehaviorSubject(Object([]));
  public page: number;
  public disableNextPage: boolean;
  public noResults = false;

  constructor(
    private redditService: RedditService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
  }

  public searchReddit() {
    if (!this.redditSearchText.length) {
      return;
    }

    this.noResults = false;
    this.spinner.show();

    this.redditService
      .search(this.redditSearchText)
      .pipe(
        tap(() => this.spinner.hide()),
        tap(() => this.page = 1)
      )
      .subscribe(res => {
        if (!res.length) {
          this.noResults = true;
        }

        this.redditResults$.next(res)
      });
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
