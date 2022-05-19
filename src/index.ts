import MagicString from "magic-string";
import { parse } from "@vue/compiler-sfc";

export type BemType = "b" | "e" | "m";

export interface ICodePosition {
  column: number;
  line: number;
  offset: number;
}

export interface ILocal {
  start: ICodePosition;
  end: ICodePosition;
  source: string;
}

export interface ITemplateTagPropValue {
  type: number; // 2
  content: string;
  loc: ILocal;
}

export interface ITemplateTagProp {
  type: number; // 6 7
  name: string; // e:xx class
  loc: ILocal;
  value?: ITemplateTagPropValue;
}

export interface ITemplateAstNode {
  type: number; // 1
  tag: string;
  tagType: number;
  props: ITemplateTagProp[];
  isSelfClosing: boolean;
  children: ITemplateAstNode[];
  loc: ILocal;
}

function transformAhaBem(
  templateAst: ITemplateAstNode,
  magic: MagicString,
  block = ""
) {
  let splicing = block;
  // 有效tag
  if (templateAst.type === 1) {
    // 属性值
    let props = templateAst.props;
    let hasHandleBlock = false;
    let hasHandleElement = false;
    let modifyClasses = [];
    // 先排序
    props = props.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    for (let i = 0; i < props.length; i++) {
      const prop = props[i] as ITemplateTagProp;
      // 其他类型
      if (prop.type !== 6) {
        // TODO :class prop.type === 7 class变量处理
        continue;
      }
      // 非变量
      // class="xxx" 
      // TODO class 值合并
      if (prop.name === "class") {
        prop.value?.content;
        continue;
      }
      // e:header
      if (/^(b|e|m):[\w\d]+/.test(prop.name)) {
        const params = prop.name.split(":");
        const bemType: BemType = params[0] as BemType;
        const bemValue = params[1];
        if (!bemValue) {
          continue;
        }
        // block 只处理1次
        if (bemType === "b" && !hasHandleBlock) {
          block = bemValue;
          splicing = block;
          hasHandleBlock = true;
        }
        // element 只处理1次
        if (bemType === "e" && !hasHandleElement) {
          splicing = block + "__" + bemValue;
          hasHandleElement = true;
        }
        // modify xxx | v-xxx 可处理多次
        // TODO 响应式处理
        if (bemType === "m") {
          modifyClasses.push(splicing + "--" + bemValue);
        }
      }
    }

    // 已生成：block 、 splicing 、 modifyClasses
    // 拼接成class
    let classValue = " ";
    // 处理过block
    if (hasHandleBlock) {
      classValue = block + " ";
    }
    if (block.length) {
      // 处理过element
      if (hasHandleElement) {
        classValue = classValue + splicing + " ";
      }
      // 拼接属性
      modifyClasses.forEach((modifyClass) => {
        classValue = classValue + modifyClass + " ";
      });

      if (classValue.trim().length) {
        magic.appendLeft(
          templateAst.loc.start.offset + templateAst.tag.length + 1,
          ` class="${classValue}" `
        );
      }
    }

    for (let i = 0; i < templateAst.children.length; i++) {
      const child = templateAst.children[i] as ITemplateAstNode;
      transformAhaBem(child, magic, block);
    }
  }
}

function supportAhaBem(code: string, _id: string) {
  let s: MagicString;
  const str = () => s || (s = new MagicString(code));
  const { descriptor } = parse(code, {
    ignoreEmpty: false,
  });

  if (descriptor.template) {
    transformAhaBem(descriptor.template.ast as ITemplateAstNode, str(), "");
  }
  return {
    map: str().generateMap(),
    code: str().toString(),
  };
}

const fileRegex = /\.(vue)$/;

function ViteAhaBemPlugin() {
  return {
    name: "vite-plugin-aha-bem",
    enforce: "pre",
    transform(code: string, id: string) {
      if (fileRegex.test(id)) {
        return supportAhaBem.call(this, code, id);
      }
      return null;
    },
  };
}

export default ViteAhaBemPlugin;
