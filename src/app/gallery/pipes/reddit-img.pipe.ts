import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'redditImg'
})
export class RedditImgPipe implements PipeTransform {

  protected static IMG_REGEXP = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|gif|png)/;
  protected static DEFAULT_REDDIT_IMG_PATH = '/assets/img/i-reddit.png';

  transform(value: any, args?: any): any {
    const isValidImgUrl = RedditImgPipe.IMG_REGEXP.test(value);

    return isValidImgUrl ? value : RedditImgPipe.DEFAULT_REDDIT_IMG_PATH;
  }

}
