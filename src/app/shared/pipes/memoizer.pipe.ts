import { Pipe, PipeTransform } from '@angular/core';

/**
 * @description This pipe is designed to be used in a template to access a component method:
 * @example In a template: {{ valueA | memoizerPipe : componentMethodRef : valueB }}
 * @implements {PipeTransform}
 * CAUTION: Methods needs to be defined an ARROW FUNCTION inside component classes
 * This is because the memoizerPipe cannot apply the proper context (uses null) when invoking the function. As such,
 * we need to pre-bind it to the component so that we can use the proper "this" reference when invoked via the memoizerPipe.
 */

@Pipe({
  name: 'memoizer',
  pure: true,
})
export class MemoizerPipe implements PipeTransform {
  transform(templateValue: any, fnReference: Function, ...fnArguments: any[]): any {
    // Due to the way pipes receive arguments, we may have inputs on both sides of
    // the function reference. As such, let's join the two input sets.
    fnArguments.unshift(templateValue);

    // CAUTION: The function reference will NOT BE INVOKED IN THE COMPONENT CONTEXT.
    // As such, a component must bind the reference if it needs to use the "this"
    // scope within the function body.
    return fnReference.apply(null, fnArguments);
  }
}
