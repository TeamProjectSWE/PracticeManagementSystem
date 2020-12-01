import React from 'react';
import PropTypes from 'prop-types';

/* Design Import */
import './Tag.scss';

/* Icon Import */
// Python, Ruby, Go, Java, JS, Kotlin, Swift, C, CPP, CS
import {
  mdiLanguagePython as Python,
  mdiLanguageRuby as Ruby,
  mdiLanguageGo as Go,
  mdiLanguageJava as Java,
  mdiLanguageJavascript as JS,
  mdiLanguageKotlin as Kotlin,
  mdiLanguageSwift as Swift,
  mdiLanguageC as C,
  mdiLanguageCpp as CPP,
  mdiLanguageCsharp as CS,
  mdiEmoticonConfused
} from "@mdi/js";
import Icon from "@mdi/react";

const Tag = props => {
  const { code, size } = props;

  /* Method */
  const getTagIcon = () => {
    switch (code) {
      case 'Python': return <Icon className="icon" path={ Python } size={size}/>;
      case 'Ruby': return <Icon className="icon" path={ Ruby } size={size}/>;
      case 'Go': return <Icon className="icon" path={ Go } size={size}/>;
      case 'Java': return <Icon className="icon" path={ Java } size={size}/>;
      case 'JS': return <Icon className="icon" path={ JS } size={size}/>;
      case 'Kotlin': return <Icon className="icon" path={ Kotlin } size={size}/>;
      case 'Swift': return <Icon className="icon" path={ Swift } size={size}/>;
      case 'C': return <Icon className="icon" path={ C } size={size}/>;
      case 'CPP': return <Icon className="icon" path={ CPP } size={size}/>;
      case 'CS': return <Icon className="icon" path={ CS } size={size}/>;
      default: return <Icon className="icon" path={ mdiEmoticonConfused } size={0.7}/>
    }
  };

  return (
    <span className={'tag'}>
      {getTagIcon()}
    </span>
  );
};

Tag.propTypes = {
  code: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired
};


export default Tag;
