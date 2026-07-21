export function LoggerComponent(props: any) {
  console.log('[AI MESSAGE]', {
    component: props?.component,
    hasAction: !!props?.data?.action,
    actionName: props?.data?.action?.name,
    actionDataKeys: props?.data?.action?.data ? Object.keys(props.data.action.data) : null,
    fullProps: props,
  });
  // Render the message as plain text so widget still works
  return (
    <div style={{ padding: '8px 12px' }}>{props?.data?.message}</div>
  );
}
