import React, {createContext, useContext, useMemo} from 'react';
import I18n from '../../src/I18n.js';
const defaultValue=Object.freeze({language:'pt-BR',t:(source,params)=>I18n.t('pt-BR',source,params)});
const LanguageContext=createContext(defaultValue);
export function LanguageProvider({language='pt-BR',children}) {
  const value=useMemo(()=>({language:I18n.normalizeLanguage(language),t:(source,params)=>I18n.t(language,source,params)}),[language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useI18n(){return useContext(LanguageContext);}
export {I18n};
