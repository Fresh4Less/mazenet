# Design for Permissions and ACLs for Mazenet.

DRAFT

TODO

[Typescript API](/common/api/permissions.ts)

Key things it should have

- Hierarchical, if ACLs for an action are not set locally, walk up the inheritance tree (mostly parent rooms) until an ACL is found. The root room should have some default ACL for everything. 


Questions:
- Inheritance...
	
