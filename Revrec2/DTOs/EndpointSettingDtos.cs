using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace Revrec2.DTOs
{
[XmlRoot(ElementName="endpoint")]
	public class Endpoint {
		[XmlAttribute(AttributeName="name")]
		public string Name { get; set; }
		[XmlText]
		public string Value { get; set; }
	}

	[XmlRoot(ElementName="module")]
	public class Module {
		[XmlElement(ElementName="endpoint")]
		public List<Endpoint> Endpoint { get; set; }

		[XmlAttribute(AttributeName="name")]
		public string Name { get; set; }
	}

	[XmlRoot(ElementName="configuration")]
	public class Configuration {
		[XmlElement(ElementName="module")]
		public List<Module> Module { get; set; }
	}
}